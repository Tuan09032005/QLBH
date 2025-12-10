<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { notifyError } from '@/stores/notifications'
import HeroBanner from './HeroBanner.vue'
import BannerAd from './BannerAd.vue'

const allProducts = ref([])
const categories = ref([])
const selectedCategories = ref([])
const selectedPriceRanges = ref([])
const selectedRates = ref([])
const searchQuery = ref('')
const sortOption = ref('newest') // newest | price-asc | price-desc | rating

const cart = useCartStore()
const router = useRouter()
const route = useRoute()

// keep router for updating query
// router already defined above

const priceRanges = [
  { label: 'Dưới 20$', value: 'under20', check: (price) => price < 20 },
  { label: 'Từ 20$ đến 50$', value: '20to50', check: (price) => price >= 20 && price <= 50 },
  { label: 'Trên 50$', value: 'above50', check: (price) => price > 50 }
]

const rateOptions = [
  { label: 5, value: 5 },
  { label: 4, value: 4 },
  { label: 3, value: 3 },
  { label: 2, value: 2 },
  { label: 1, value: 1 }
]

// Lấy dữ liệu từ Supabase
onMounted(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    notifyError('Lỗi khi tải sản phẩm từ Supabase: ' + (error?.message || error))
  } else {
    allProducts.value = data
    categories.value = [...new Set(data.map(p => p.category))]
    // if route has a category query, try to pre-select it
    if (route && route.query && route.query.category) {
      const q = String(route.query.category || '')
      const match = categories.value.find(c => normalize(c) === normalize(q))
      if (match) selectedCategories.value = [match]
    }
    // if route has a search query 'q', populate searchQuery so filtering happens
    if (route && route.query && route.query.q) {
      searchQuery.value = String(route.query.q || '')
    }
  }
  // subscribe to realtime changes so user pages update automatically
  try {
    const productsChannel = supabase.channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        // payload.eventType could be 'INSERT'|'UPDATE'|'DELETE' depending on supabase version
        const ev = payload.eventType || payload.event
        const newRow = payload.new || payload.record || null
        const oldRow = payload.old || null
        if (!ev) return
        if (ev === 'INSERT') {
          if (newRow) allProducts.value = [...allProducts.value, newRow]
        } else if (ev === 'UPDATE') {
          if (newRow) {
            const idx = allProducts.value.findIndex(x => x.id === newRow.id)
            if (idx >= 0) allProducts.value.splice(idx, 1, newRow)
            else allProducts.value.push(newRow)
          }
        } else if (ev === 'DELETE') {
          if (oldRow) allProducts.value = allProducts.value.filter(x => x.id !== oldRow.id)
        }
      })
      .subscribe()
    // store channel on component ref for cleanup
    ;(window.__supabase_products_channel__ = window.__supabase_products_channel__ || []).push(productsChannel)
  } catch (err) {
    console.warn('Realtime subscription error (products):', err)
  }
})

onBeforeUnmount(() => {
  try {
    const arr = window.__supabase_products_channel__ || []
    if (arr.length) {
      arr.forEach(ch => { try { supabase.removeChannel?.(ch); ch.unsubscribe?.() } catch(e){} })
      window.__supabase_products_channel__ = []
    }
  } catch (err) {}
})

// react to query param 'q' changes (from navbar or direct url)
watch(() => route.query.q, (newQ) => {
  if (newQ === undefined) return
  const q = String(newQ || '')
  if (q !== searchQuery.value) searchQuery.value = q
})

// keep URL in sync when user types in the local search input
watch(searchQuery, (newVal) => {
  const q = (newVal || '').trim()
  const currentQ = route.query.q || ''
  if (q === currentQ) return
  // use replace to avoid polluting history on each keystroke
  router.replace({ path: route.path, query: { ...route.query, q: q || undefined } }).catch(() => {})
})

// normalization helper to match categories regardless of diacritics/case/spacing
const normalize = (s) => {
  if (!s) return ''
  return String(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\d]/g, '')
    .toLowerCase()
}

// react to category query changes (clicking banners)
watch(() => route.query.category, (newCat) => {
  if (!newCat) return
  const q = String(newCat)
  const match = categories.value.find(c => normalize(c) === normalize(q))
  if (match) selectedCategories.value = [match]
})

// Parse rating helper (handles rating__rate/rating object/string)
const parseRating = (p) => {
  if (!p) return { rate: 0, count: 0 }
  if (p.rating__rate !== undefined || p.rating__count !== undefined) {
    return { rate: Number(p.rating__rate) || 0, count: Number(p.rating__count) || 0 }
  }
  if (typeof p.rating === 'string') {
    try { return JSON.parse(p.rating) } catch { return { rate: 0, count: 0 } }
  }
  if (typeof p.rating === 'object') return p.rating || { rate: 0, count: 0 }
  return { rate: 0, count: 0 }
}

// return stock/quantity from product object (support multiple field names)
const getStock = (p) => {
  if (!p) return null
  const keys = ['stock', 'quantity', 'qty', 'inventory', 'available', 'remaining']
  for (const k of keys) {
    if (p[k] !== undefined && p[k] !== null) return Number(p[k])
  }
  // try rating.count as a fallback for demo data (not actual stock)
  if (p.rating__count !== undefined) return Number(p.rating__count) || 0
  if (p.rating && p.rating.count !== undefined) return Number(p.rating.count) || 0
  return null
}

const availableToAdd = (p) => {
  const stock = getStock(p)
  if (stock === null) return null
  const inCart = cart.items.find(i => i.id === p.id)?.quantity || 0
  return Math.max(0, stock - inCart)
}

const handleAdd = (p) => {
  const avail = availableToAdd(p)
  if (avail !== null && avail <= 0) {
    showAddToCartToast(p.title + ' — hết hàng hoặc đã có trong giỏ')
    return
  }
  const toAdd = (avail === null) ? 1 : Math.min(1, avail)
  cart.addToCart(p, toAdd)
  showAddToCartToast(p.title)
}

// Lọc sản phẩm (bao gồm tìm kiếm và sắp xếp)
const filteredProducts = computed(() => {
  let list = allProducts.value.filter(p => {
    const matchCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(p.category)
    const matchPrice = selectedPriceRanges.value.length === 0 || selectedPriceRanges.value.some(rangeVal => {
      const range = priceRanges.find(r => r.value === rangeVal)
      return range && range.check(p.price)
    })
    const r = parseRating(p)
    // change to "trở xuống": match when product rate is less than or equal to selected threshold
    const matchRate = selectedRates.value.length === 0 || selectedRates.value.some(rate => r.rate <= rate)

    // search by title or description
    const q = searchQuery.value && searchQuery.value.trim().toLowerCase()
    const matchSearch = !q || (`${p.title || ''} ${p.description || ''}`).toLowerCase().includes(q)

    return matchCategory && matchPrice && matchRate && matchSearch
  })

  // sort
  if (sortOption.value === 'price-asc') list = list.sort((a,b) => Number(a.price) - Number(b.price))
  else if (sortOption.value === 'price-desc') list = list.sort((a,b) => Number(b.price) - Number(a.price))
  else if (sortOption.value === 'rating') list = list.sort((a,b) => parseRating(b).rate - parseRating(a).rate)
  else list = list.sort((a,b) => (b.id || 0) - (a.id || 0)) // newest by id desc

  return list
})

const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

watch([selectedCategories, selectedPriceRanges, selectedRates], () => {
  currentPage.value = 1
})

const goToDetail = (id) => router.push(`/product/${id}`)

const showToast = ref(false)
const toastMessage = ref('')
const toastTimeout = ref(null)

const showAddToCartToast = (productName) => {
  toastMessage.value = `✔️ ${productName} đã được thêm vào giỏ hàng!`
  showToast.value = true
  if (toastTimeout.value) clearTimeout(toastTimeout.value)
  toastTimeout.value = setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const clearFilters = () => {
  selectedCategories.value = []
  selectedPriceRanges.value = []
  selectedRates.value = []
  currentPage.value = 1
}

const clearSearchQuery = () => {
  searchQuery.value = ''
  const qObj = { ...route.query }
  if (qObj.q) delete qObj.q
  router.replace({ path: route.path, query: qObj }).catch(() => {})
}
</script>


<template>
  <div class="container mt-4">
    <!-- Hero banner (title) -->
    <HeroBanner />
    <h2 class="mb-3 text-info">Danh sách sản phẩm</h2>

    <div class="row">
            <!-- BỘ LỌC -->
            <div class="col-md-3">
              <div class="filter-panel sticky-top" style="top: 20px;z-index: 500;">
                <h5 class="fw-bold d-flex justify-content-between align-items-center">
                  <span><i class="bi  text-brand"></i> Lọc</span>
                  <button class="btn btn-sm btn-link text-danger" @click="clearFilters">Xóa</button>
                </h5>

                <div class="mb-3">
                  <label class="form-label small">Tìm kiếm</label>
                  <input type="search" class="form-control" v-model="searchQuery" placeholder="Tìm theo tên hoặc mô tả" />
                </div>

                <h6 class="fw-bold"><i class="bi  text-secondary"></i> Danh mục</h6>
                <div v-for="c in categories" :key="c" class="form-check mb-2">
                  <input type="checkbox" class="form-check-input" :id="c" :value="c" v-model="selectedCategories" />
                  <label class="form-check-label" :for="c">{{ c }}</label>
                </div>

                <hr>
                <h6 class="fw-bold"><i class="bi  text-warning"></i> Giá</h6>
                <div v-for="r in priceRanges" :key="r.value" class="form-check mb-2">
                  <input type="checkbox" class="form-check-input" :id="r.value" :value="r.value" v-model="selectedPriceRanges" />
                  <label class="form-check-label" :for="r.value">{{ r.label }}</label>
                </div>

                <hr>
                <h6 class="fw-bold"><i class="bi text-warning"></i> Đánh giá</h6>
                <div v-for="r in rateOptions" :key="r.value" class="form-check mb-2">
                  <input type="checkbox" class="form-check-input" :id="'rate' + r.value" :value="r.value" v-model="selectedRates" />
                  <label class="form-check-label" :for="'rate' + r.value">{{ r.value }} điểm trở xuống</label>
                </div>

                <hr>
                <h6 class="fw-bold"><i class="bi "></i> Sắp xếp</h6>
                <select class="form-select mb-2" v-model="sortOption">
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="rating">Đánh giá</option>
                </select>

                <button class="btn btn-outline-warning mt-2 w-100" @click="clearFilters">Xóa bộ lọc</button>
              </div>
            </div>

            <!-- DANH SÁCH SẢN PHẨM -->
            <div class="col-md-9">
              <div class="mb-3">
                <BannerAd />
              </div>
              <div v-if="searchQuery" class="mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="text-muted">Kết quả tìm kiếm cho: <strong>"{{ searchQuery }}"</strong> — {{ filteredProducts.length }} kết quả</div>
                  <div>
                    <button class="btn btn-sm btn-outline-secondary" @click="clearSearchQuery">Xóa tìm kiếm</button>
                  </div>
                </div>
              </div>
              <div class="row">
          <div v-for="p in paginatedProducts" :key="p.id" class="col-12 col-sm-6 col-md-6 col-lg-4 mb-4">
            <div
              class="card h-100 shadow-sm product-card w-100 position-relative clickable-card"
              @click="goToDetail(p.id)"
              @keydown.enter.prevent="goToDetail(p.id)"
              role="button"
              tabindex="0"
            >
                <div class="img-wrap">
                  <img :src="p.image" alt="" loading="lazy" />
                </div>

                <div class="card-body d-flex flex-column">
                  <h6 class="card-title text-truncate" :title="p.title">{{ p.title }}</h6>
                  <p class="mb-2 price-text">
                    <strong class="text-danger">{{ Number(p.price).toFixed(2) }} $</strong>
                    <small class="text-muted ms-2">-</small>
                  </p>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <small v-if="getStock(p) !== null" class="text-muted">Tồn kho: <strong>{{ getStock(p) }}</strong></small>
                      <small v-else class="text-muted">Tồn kho: N/A</small>
                    </div>
                    <div>
                      <small v-if="getStock(p) === 0" class="text-danger">Hết hàng</small>
                    </div>
                  </div>

                  <div class="mt-auto d-flex justify-content-between align-items-center">
                    <div class="rating text-warning">
                        <strong>{{ parseRating(p).rate.toFixed(1) }} điểm</strong>
                        <small class="text-muted ms-2">({{ parseRating(p).count }} đánh giá)</small>
                      </div>

                    <div class="card-actions d-flex align-items-center">
                      <button
                        class="btn btn-sm btn-danger btn-add"
                        @click.stop="() => handleAdd(p)"
                        :disabled="availableToAdd(p) !== null && availableToAdd(p) <= 0"
                        :title="(availableToAdd(p) !== null && availableToAdd(p) <= 0) ? 'Sản phẩm tạm hết hàng' : 'Thêm vào giỏ'"
                      >
                        <i class="bi bi-cart-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

              <!-- hover overlay removed -->
            </div>
          </div>

          <div v-if="filteredProducts.length === 0" class="text-muted p-4">
            Không có sản phẩm phù hợp.
          </div>
        </div>

        <!-- PHÂN TRANG -->
        <nav aria-label="Page navigation" class="mt-3 d-flex justify-content-center">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="() => { if(currentPage > 1) currentPage-- }">
              <a class="page-link" href="#">Previous</a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }" @click="() => { currentPage = page }">
              <a class="page-link" href="#">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }" @click="() => { if(currentPage < totalPages) currentPage++ }">
              <a class="page-link" href="#">Next</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <!-- TOAST -->
  <transition name="fade">
    <div v-if="showToast" class="custom-toast position-fixed top-0 start-50 translate-middle-x mt-4 shadow-lg rounded-3" style="z-index: 1055;">
      <div class="d-flex align-items-center p-3 bg-success text-white rounded-3">
        <i class="bi bi-cart-check-fill me-2" style="font-size: 1.2rem;"></i>
        <div class="flex-grow-1">{{ toastMessage }}</div>
        <button class="btn btn-sm btn-close btn-close-white ms-3" @click="showToast = false"></button>
      </div>
    </div>
  </transition>
</template>



<style scoped>
.product-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
/* make card clearly clickable */
.clickable-card { cursor: pointer; }
.clickable-card:focus { outline: none; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

/* image subtle scale on hover */
.product-card .product-thumb { transition: transform 0.36s ease; }
.product-card:hover .product-thumb { transform: scale(1.04); }

/* hover overlay removed */
  .card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 3em;
  line-height: 1.5em;
}
.filter-panel {
  background: #f9f9f9;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.hero-banner { margin-bottom: 12px; }
.banner-ad { margin-bottom: 18px; }
/* slightly larger rectangular cards */
.img-wrap { position: relative; height: 140px; display:flex; align-items:center; justify-content:center; background: #fff; overflow: hidden; padding: 8px; }
.img-wrap img { max-height: 120px; width: auto; object-fit: contain; display:block; }
.price-text { color: #dc2626; font-weight: 700; }
.product-card { min-height: 280px; border-radius: 8px; }
.card-title { font-size: 1rem; margin-bottom: 0.5rem; }
.rating i { margin-right: 4px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 576px) {
  .img-wrap { height: 140px; padding: 6px; }
  .img-wrap img { max-height: 110px; }
  .product-card { min-height: 250px; }
}

/* Hover: change product title color when card hovered */
.card-title { transition: color 160ms ease; }
.product-card:hover .card-title { color: var(--brand, #dc2626); }

/* Actions: single cart button styling */
.card-actions { gap: 6px; }
.btn-add { padding: 6px 10px; border-radius: 8px; display:inline-flex; align-items:center; justify-content:center; }
.btn-add i { font-size: 1rem; }

/* Slightly tighter card spacing to fit larger cards neatly */
.product-card { padding-bottom: 10px; }
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.custom-toast {
  min-width: 280px;
  max-width: 400px;
  font-size: 0.9rem;
  animation: slide-down 0.4s ease-out;
}
@keyframes slide-down {
  from {
    transform: translateY(-20px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
