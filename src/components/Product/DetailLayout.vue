<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { useCartStore } from '@/stores/cart.js'
import { notifyError } from '@/stores/notifications.js'

const route = useRoute()
const cart = useCartStore()
const router = useRouter()

const product = ref(null)
const quantity = ref(1)
const isAdding = ref(false)
const addedMessage = ref('')
const showAddedMessage = ref(false)
const relatedProducts = ref([])

const loadProduct = async (id) => {
  if (!id) return
  product.value = null
  relatedProducts.value = []
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    notifyError('Lỗi khi load sản phẩm: ' + (error.message || ''))
    return
  }

  product.value = data
  // load related products based on category
  try {
    await fetchRelated(id, product.value.category)
  } catch (err) {
    notifyError('Lỗi khi load sản phẩm liên quan: ' + (err && err.message ? err.message : err))
  }
}

onMounted(() => {
  loadProduct(route.params.id)
})

// watch for route id changes so clicking "Xem" on a related product reloads details
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadProduct(newId)
    // scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const fetchRelated = async (id, category) => {
  if (!category) return
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', id)
    .limit(8)

  if (error) {
    notifyError('Lỗi lấy sản phẩm liên quan: ' + (error.message || ''))
    relatedProducts.value = []
  } else {
    relatedProducts.value = data || []
  }
}

const viewProduct = (id) => {
  if (!id) return
  router.push({ name: 'ProductDetail', params: { id } }).catch(() => {
    // fallback to path
    router.push(`/product/${id}`)
  })
}

const addRelatedToCart = (rp) => {
  if (!rp) return
  cart.addToCart(rp, 1)
  addedMessage.value = `✅ Đã thêm 1 sản phẩm vào giỏ hàng!`
  showAddedMessage.value = true
  setTimeout(() => {
    showAddedMessage.value = false
  }, 3000)
}

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1)    {
    quantity.value--
  }
}

const validateQuantity = () => {
  if (!quantity.value || quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > 999) {
    quantity.value = 999
  }
}

const addToCart = () => {
  if (product.value && quantity.value > 0) {
    isAdding.value = true
    cart.addToCart(product.value, quantity.value)
    addedMessage.value = `✅ Đã thêm ${quantity.value} sản phẩm vào giỏ hàng!`
    showAddedMessage.value = true
    
    setTimeout(() => {
      showAddedMessage.value = false
      isAdding.value = false
    }, 3000)
    
    quantity.value = 1
  }
}

const buyNow = () => {
  if (product.value && quantity.value > 0) {
    isAdding.value = true
    cart.addToCart(product.value, quantity.value)
    // navigate to cart for quick checkout
    router.push('/cart')
  }
}
</script>

<template>
  <!-- Product Detail Section -->
  <div class="product-detail-wrapper" v-if="product">
    <!-- Breadcrumb -->
    <div class="breadcrumb-section py-3 border-bottom">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><router-link to="/product">Sản Phẩm</router-link></li>
            <li class="breadcrumb-item">{{ product.category }}</li>
            <li class="breadcrumb-item active">{{ product.title }}</li>
          </ol>
        </nav>
      </div>
    </div>

    <div class="container py-5">
      <div class="row gx-5">
        <!-- Product Image -->
        <div class="col-lg-5 mb-4 mb-lg-0">
          <div class="product-image-container">
            <img
              :src="product.image"
              alt="Product image"
              class="product-image"
            />
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-lg-7">
          <!-- Product Header -->
          <div class="product-header mb-4">
            <span class="category-badge">{{ product.category }}</span>
            <h1 class="product-title mt-3 mb-3">{{ product.title }}</h1>
            
            <!-- Rating -->
            <div class="rating-section mb-3">
              <div class="d-flex align-items-center">
                <div class="stars me-2">
                  <i v-for="i in 5" :key="i" class="bi" :class="i <= Math.round(product.rating__rate || 0) ? 'bi-star-fill' : 'bi-star'"></i>
                </div>
                <span class="rating-text">
                  {{ (product.rating__rate || 0).toFixed(1) }} / 5
                  <small class="text-muted">({{ product.rating__count || 0 }} đánh giá)</small>
                </span>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="price-section mb-4 pb-4 border-bottom">
            <h2 class="price">{{ product.price.toFixed(2) }} $</h2>
          </div>

          <!-- Description -->
          <div class="description-section mb-4">
            <h5 class="fw-semibold mb-2">Mô Tả Sản Phẩm</h5>
            <p class="text-muted">{{ product.description || 'Không có mô tả chi tiết.' }}</p>
          </div>

          <!-- Quantity Selection -->
          <div class="quantity-section mb-4">
            <h5 class="fw-semibold mb-3">Chọn Số Lượng</h5>
            <div class="quantity-controls">
              <button
                class="qty-btn"
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                title="Giảm số lượng"
              >
                <i class="bi bi-dash"></i>
              </button>
              <input
                type="number"
                v-model.number="quantity"
                class="qty-input"
                min="1"
                max="999"
                @change="validateQuantity"
                @blur="validateQuantity"
              />
              <button
                class="qty-btn"
                @click="increaseQuantity"
                title="Tăng số lượng"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>
            <small class="text-muted d-block mt-2">Tối đa: 999 sản phẩm</small>
          </div>

          <!-- Add to Cart Button -->
          <div class="action-buttons mb-4">
            <button
              class="btn btn-danger btn-lg fw-semibold add-to-cart-btn"
              @click="addToCart"
              :disabled="isAdding"
            >
              <i v-if="!isAdding" class="bi bi-cart-plus me-2"></i>
              <span v-if="!isAdding">Thêm Vào Giỏ Hàng</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang Thêm...
              </span>
            </button>

            <button class="btn btn-outline-danger btn-lg fw-semibold ms-2" @click="buyNow">
              <i class="bi bi-bolt me-2"></i>Mua Ngay
            </button>

            <router-link to="/product" class="btn btn-outline-secondary btn-lg fw-semibold ms-2">
              <i class="bi bi-arrow-left me-2"></i>Quay Lại
            </router-link>
          </div>

          <!-- Success Message -->
          <div v-if="showAddedMessage" class="alert alert-success alert-dismissible fade show border-0 rounded-3" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ addedMessage }}
          </div>

          <!-- Product Details -->
          <div class="product-details bg-light p-4 rounded-3 mt-5">
            <h5 class="fw-semibold mb-3">Thông Tin Sản Phẩm</h5>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Mã Sản Phẩm:</span>
                <span class="detail-value">{{ product.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Danh Mục:</span>
                <span class="detail-value text-capitalize">{{ product.category }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Trạng Thái:</span>
                <span class="detail-value">
                  <span class="badge bg-success">Còn Hàng</span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Miễn Phí Vận Chuyển:</span>
                <span class="detail-value text-success fw-semibold">Có</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Related Products -->
  <div v-if="relatedProducts.length" class="related-section container py-4">
    <h4 class="mb-4">Sản phẩm liên quan</h4>
    <div class="row">
      <div class="col-6 col-md-3 mb-3" v-for="rp in relatedProducts" :key="rp.id">
        <div class="card related-card h-100">
          <img :src="rp.image" class="card-img-top related-img" alt="" />
          <div class="card-body p-2 d-flex flex-column">
            <h6 class="card-title mb-2 text-truncate">{{ rp.title }}</h6>
            <p class="mb-2 text-danger fw-bold">{{ rp.price.toFixed(2) }} $</p>
            <div class="mt-auto d-grid gap-2">
              <button class="btn btn-sm btn-outline-secondary" @click="viewProduct(rp.id)">Xem</button>
              <button class="btn btn-sm btn-danger" @click="addRelatedToCart(rp)">Thêm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="loading-state">
    <div class="container text-center py-5">
      <div class="spinner-border mb-3" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="text-muted">Đang tải sản phẩm...</p>
    </div>
  </div>
</template>

<style scoped>
/* Product Detail Wrapper */
.product-detail-wrapper {
  background: #fff;
}

/* Breadcrumb Section */
.breadcrumb-section {
  background: #f9fafb;
}

.breadcrumb {
  margin-bottom: 0;
}

.breadcrumb-item a {
  color: #dc2626;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item a:hover {
  color: #991b1b;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6b7280;
}

/* Product Image Container */
.product-image-container {
  position: sticky;
  top: 20px;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.product-image {
  max-width: 100%;
  max-height: 380px;
  object-fit: contain;
  display: block;
}

/* Product Header */
.product-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.category-badge {
  display: inline-block;
  background: #fef3f2;
  color: #dc2626;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.product-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

/* Rating Section */
.rating-section {
  padding: 12px 0;
}

.stars {
  font-size: 18px;
  color: #fbbf24;
  letter-spacing: 2px;
}

.stars i {
  margin-right: 2px;
}

.rating-text {
  color: #6b7280;
  font-size: 14px;
}

/* Price Section */
.price-section {
  padding: 20px 0;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #dc2626;
  margin: 0;
}

/* Description Section */
.description-section h5 {
  color: #111827;
}

.description-section p {
  line-height: 1.6;
  color: #6b7280;
  font-size: 15px;
}

/* Quantity Section */
.quantity-section h5 {
  color: #111827;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  border-color: #dc2626;
  color: #dc2626;
  background: #fef3f2;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 70px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  color: #111827;
  transition: all 0.2s ease;
}

.qty-input:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.add-to-cart-btn {
  background: #dc2626;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  flex: 1;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #991b1b;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
}

.add-to-cart-btn:disabled {
  background: #dc2626;
  opacity: 0.8;
  cursor: wait;
}

.action-buttons .btn-outline-secondary {
  border: 2px solid #e5e7eb;
  color: #111827;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-buttons .btn-outline-secondary:hover {
  border-color: #111827;
  background: #111827;
  color: #fff;
}

/* Success Message */
.alert-success {
  animation: slideInDown 0.4s ease;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  color: #065f46;
  padding: 14px 16px;
}

.alert-success i {
  color: #10b981;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Product Details Info */
.product-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.product-details h5 {
  color: #111827;
  font-size: 18px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:nth-child(odd):nth-last-child(1),
.detail-item:nth-child(even):nth-last-child(-n+2) {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
}

/* Related Products */
.related-section h4 {
  color: #111827;
  font-weight: 700;
}
.related-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.related-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(17,24,39,0.08);
}
.related-img {
  height: 140px;
  object-fit: contain;
  background: #fff;
  padding: 12px;
}

.detail-value {
  color: #111827;
  font-weight: 500;
  text-align: right;
}

/* Loading State */
.loading-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.spinner-border {
  color: #dc2626;
  width: 48px;
  height: 48px;
  border-width: 4px;
}

/* Responsive Design */
@media (max-width: 991px) {
  .product-image-container {
    position: relative;
    top: auto;
    min-height: 300px;
    margin-bottom: 30px;
  }

  .product-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .product-image-container {
    min-height: 250px;
    padding: 15px;
  }

  .product-image {
    max-height: 250px;
  }

  .product-title {
    font-size: 20px;
  }

  .price {
    font-size: 28px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .quantity-controls {
    width: 100%;
  }

  .qty-input {
    flex: 1;
  }

  .product-details {
    margin-top: 30px;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    font-size: 12px;
  }

  .product-title {
    font-size: 18px;
  }

  .price {
    font-size: 24px;
  }

  .qty-btn,
  .qty-input {
    height: 36px;
  }

  .qty-btn {
    width: 36px;
    font-size: 16px;
  }

  .qty-input {
    width: 60px;
    padding: 6px 10px;
    font-size: 14px;
  }

  .add-to-cart-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .product-header {
    margin-bottom: 20px;
  }

  .category-badge {
    padding: 4px 8px;
    font-size: 11px;
  }

  .stars {
    font-size: 16px;
  }

  .detail-label,
  .detail-value {
    font-size: 12px;
  }
}
</style>
