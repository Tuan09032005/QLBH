<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const allProducts = ref([])
const categories = ref([])
const selectedCategories = ref([])
const selectedPriceRanges = ref([])
const selectedRates = ref([])

const cart = useCartStore()
const router = useRouter()

const priceRanges = [
  { label: 'Dưới 20$', value: 'under20', check: (price) => price < 20 },
  { label: 'Từ 20$ đến 50$', value: '20to50', check: (price) => price >= 20 && price <= 50 },
  { label: 'Trên 50$', value: 'above50', check: (price) => price > 50 }
]

const rateOptions = [
  { label: 'Từ 5 sao', value: 5 },
  { label: 'Từ 4 sao', value: 4 },
  { label: 'Từ 3 sao', value: 3 },
  { label: 'Từ 2 sao', value: 2 },
  { label: 'Từ 1 sao', value: 1 }
]

// Lấy dữ liệu từ Supabase
onMounted(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    console.error('Lỗi khi tải sản phẩm từ Supabase:', error)
  } else {
    allProducts.value = data
    categories.value = [...new Set(data.map(p => p.category))]
  }
})

// Lọc sản phẩm
const filteredProducts = computed(() => {
  return allProducts.value.filter(p => {
    const matchCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(p.category)
    const matchPrice = selectedPriceRanges.value.length === 0 || selectedPriceRanges.value.some(rangeVal => {
      const range = priceRanges.find(r => r.value === rangeVal)
      return range && range.check(p.price)
    })
    const matchRate = selectedRates.value.length === 0 || selectedRates.value.some(rate => {
      return p.rating__rate >= rate
    })
    return matchCategory && matchPrice && matchRate
  })
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
</script>


<template>
  <div class="container mt-4">
    <h2 class="mb-4 text-info">Danh sách sản phẩm</h2>

    <div class="row">
      <!-- BỘ LỌC -->
      <div class="col-md-3">
        <div class="filter-panel sticky-top" style="top: 20px;z-index: 500;">
          <h5 class="fw-bold"><i class="bi bi-bookmark-check-fill text-primary"></i> Lọc theo danh mục</h5>
          <div v-for="c in categories" :key="c" class="form-check mb-2">
            <input type="checkbox" class="form-check-input" :id="c" :value="c" v-model="selectedCategories" />
            <label class="form-check-label" :for="c">{{ c }}</label>
          </div>

          <hr>
          <h5 class="fw-bold"><i class="bi bi-coin text-warning"></i> Lọc theo giá</h5>
          <div v-for="r in priceRanges" :key="r.value" class="form-check mb-2">
            <input type="checkbox" class="form-check-input" :id="r.value" :value="r.value" v-model="selectedPriceRanges" />
            <label class="form-check-label" :for="r.value">{{ r.label }}</label>
          </div>

          <hr>
          <h5 class="fw-bold"><i class="bi bi-star-fill text-warning"></i> Lọc theo đánh giá</h5>
          <div v-for="r in rateOptions" :key="r.value" class="form-check mb-2">
            <input type="checkbox" class="form-check-input" :id="'rate' + r.value" :value="r.value" v-model="selectedRates" />
            <label class="form-check-label" :for="'rate' + r.value">{{ r.label }} trở lên</label>
          </div>

          <button class="btn btn-outline-warning mt-3 w-100" @click="clearFilters">Xóa bộ lọc</button>
        </div>
      </div>

      <!-- DANH SÁCH SẢN PHẨM -->
      <div class="col-md-9">
        <div class="row">
          <div v-for="p in paginatedProducts" :key="p.id" class="col-md-3 mb-4 d-flex">
            <div class="card h-100 shadow-sm product-card w-100 position-relative">
              <img :src="p.image" class="card-img-top" style="height: 200px; object-fit: contain" />
              <div class="card-body">
                <h6 class="card-title">{{ p.title }}</h6>
                <p class="mb-1"><strong>{{ p.price }} $</strong></p>
                <p v-if="p.rating__rate !== undefined && p.rating__rate !== null" class="mb-1">
                  <i class="bi bi-star-fill text-warning me-1"></i>{{ p.rating__rate }}
                </p>
              </div>
              <div class="card-footer d-flex justify-content-between px-2 py-1 bg-white border-top">
                <button class="btn btn-sm btn-outline-warning" @click="goToDetail(p.id)">Chi tiết</button>
                <button class="btn btn-sm btn-info" @click="() => { cart.addToCart(p); showAddToCartToast(p.title) }">
                  Thêm vào giỏ
                </button>
              </div>
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
  padding-bottom: 45px;
  transition: transform 0.3s ease;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
.card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
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
