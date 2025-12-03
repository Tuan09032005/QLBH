<template>
  <section class="mb-5 featured-products">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="m-0">
        <i class="bi bi-fire text-warning me-2"></i> Sản phẩm nổi bật
      </h3>
      <small class="text-muted">Xem thêm trên trang sản phẩm</small>
    </div>

    <div class="row g-3">
      <div v-for="p in topRatedProducts" :key="p.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm product-card">
          <div class="img-wrap">
            <img :src="p.image" alt="" loading="lazy" />
            <div class="price-badge">{{ formatPrice(p.price) }}</div>
          </div>

          <div class="card-body d-flex flex-column">
            <h6 class="card-title text-truncate" :title="p.title">{{ p.title }}</h6>

            <div class="mt-auto d-flex justify-content-between align-items-center">
              <div class="rating text-warning">
                <span v-for="n in 5" :key="n"> 
                  <i class="bi" :class="n <= Math.round(parseRating(p).rate) ? 'bi-star-fill' : 'bi-star'"/>
                </span>
                <small class="text-muted ms-2">({{ parseRating(p).count }})</small>
              </div>

              <div class="btns">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="goToDetail(p.id)">Chi tiết</button>
                <button class="btn btn-sm btn-danger" @click="addToCart(p)">Thêm</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'

const emit = defineEmits(['goToDetail', 'addToCart'])

const goToDetail = (id) => emit('goToDetail', id)
const addToCart = (p) => emit('addToCart', p)

const products = ref([])
const loading = ref(true)
const error = ref('')

const loadProducts = async () => {
  loading.value = true
  try {
    const { data, error: err } = await supabase.from('products').select('*').order('id', { ascending: false })
    if (err) {
      console.error('Load products error:', err)
      error.value = err.message || err
      products.value = []
    } else {
      products.value = data || []
    }
  } catch (e) {
    console.error('Unexpected error loading products:', e)
    error.value = e.message || e
    products.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadProducts)

// Hàm parse rating từ chuỗi JSON hoặc cột rating__rate
const parseRating = (product) => {
  if (!product) return { rate: 0, count: 0 }
  // prefer explicit fields
  if (product.rating__rate !== undefined || product.rating__count !== undefined) {
    return { rate: Number(product.rating__rate) || 0, count: Number(product.rating__count) || 0 }
  }
  // support JSON string or object in `rating`
  try {
    if (typeof product.rating === 'string') return JSON.parse(product.rating)
    if (typeof product.rating === 'object') return product.rating || { rate: 0, count: 0 }
  } catch (e) {
    // ignore
  }
  return { rate: 0, count: 0 }
}

// Lọc và sắp xếp sản phẩm theo rating
const topRatedProducts = computed(() => {
  return [...(products.value || [])]
    .filter(p => {
      const r = parseRating(p)
      return r && typeof r.rate === 'number'
    })
    .sort((a, b) => parseRating(b).rate - parseRating(a).rate)
    .slice(0, 4)
})

const formatPrice = (v) => {
  if (v === null || v === undefined) return '0 $'
  return `${Number(v).toFixed(2)} $`
}
</script>

<style scoped>
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.product-card {
  border: none;
  overflow: hidden;
  transition: transform .18s ease, box-shadow .18s ease;
}
.product-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
.img-wrap { position: relative; height: 180px; display:flex; align-items:center; justify-content:center; background: #fff; }
.img-wrap img { max-height: 160px; max-width: 100%; object-fit: contain; }
.price-badge { position: absolute; top: 8px; right: 8px; background: rgba(220,53,69,0.95); color: #fff; padding: 6px 10px; border-radius: 20px; font-weight:600; font-size:0.9rem; }
.card-title { font-size: 0.95rem; margin-bottom: 0.75rem; }
.rating i { margin-right: 2px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 576px) {
  .img-wrap { height: 140px; }
  .img-wrap img { max-height: 120px; }
}
</style>
