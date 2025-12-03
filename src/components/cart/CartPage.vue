<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const cart = useCartStore()
const showModal = ref(false)
const continueShoppingModal = ref(false)
const isLoggedIn = ref(false)
const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')
const fullName = ref('')
const address = ref('')
const phone = ref('')
let userId = null

const increaseQuantity = (item) => {
  item.quantity++
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) item.quantity--
}

const validateQuantity = (item) => {
  if (!item.quantity || item.quantity < 1) {
    item.quantity = 1
  } else if (item.quantity > 999) {
    item.quantity = 999
  }
}

const removeItem = (item) => {
  cart.removeItem(item.id)
}

const clearCartConfirm = () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
    cart.clearCart()
  }
}

const confirmPayment = async () => {
  errorMsg.value = ''
  if (!fullName.value.trim() || !address.value.trim() || !phone.value.trim()) {
    errorMsg.value = 'Vui lòng điền đầy đủ thông tin giao hàng.'
    return
  }
  const userData = JSON.parse(localStorage.getItem('user') || 'null')
  userId = userData?.id ?? null
  const items = cart.items.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity }))
  const total = cart.totalPrice
  const order = {
    user_id: userId,
    items: JSON.stringify(items),
    total,
    full_name: fullName.value,
    address: address.value,
    phone: phone.value,
    created_at: new Date().toISOString()
  }
  loading.value = true
  try {
    console.log('📦 Gửi đơn hàng:', order)
    const { data, error } = await supabase.from('orders').insert([order]).select()
    loading.value = false
    if (error) {
      console.error('❌ Lỗi Supabase:', error)
      errorMsg.value = `Lỗi: ${error.code || error.message || 'Không rõ'}`
      return
    }
    console.log('✅ Đơn hàng đã lưu:', data)
    alert('✅ Đặt hàng thành công! Mã đơn: ' + (data?.[0]?.id || 'N/A'))
    cart.clearCart()
    showModal.value = false
    fullName.value = ''
    address.value = ''
    phone.value = ''
  } catch (err) {
    loading.value = false
    console.error('❌ Lỗi hệ thống:', err)
    errorMsg.value = `Lỗi: ${err.message || 'Không thể kết nối tới máy chủ'}`
  }
}

const handleCheckout = () => {
  if (!isLoggedIn.value) {
    alert('⚠️ Vui lòng đăng nhập trước khi thanh toán.')
    router.push('/login')
  } else {
    showModal.value = true
  }
}

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user') || 'null')
  if (userData?.isLoggedIn) {
    isLoggedIn.value = true
    userId = userData.id
  }
})
</script>

<template>
  <div class="cart-wrapper">
    <!-- Cart Header -->
    <div class="cart-header py-4 mb-4">
      <div class="container">
        <h1 class="display-6 fw-bold mb-2">🛒 Giỏ Hàng</h1>
        <p class="text-muted mb-0">{{ cart.items.length }} sản phẩm trong giỏ hàng</p>
      </div>
    </div>

    <div class="container mb-5">
      <!-- Cart Table -->
      <div v-if="cart.items.length > 0" class="cart-table-container">
        <div class="table-responsive">
          <table class="table cart-table align-middle">
            <thead>
              <tr>
                <th style="width: 80px;">Ảnh</th>
                <th>Sản Phẩm</th>
                <th style="width: 100px;">Giá</th>
                <th style="width: 180px;" class="text-center">Số Lượng</th>
                <th style="width: 120px;" class="text-end">Thành Tiền</th>
                <th style="width: 80px;" class="text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cart.items" :key="item.id" class="cart-item-row">
                <!-- Image -->
                <td>
                  <img :src="item.image" class="cart-item-img rounded" alt="Product" />
                </td>

                <!-- Product Name -->
                <td>
                  <div class="product-info">
                    <h6 class="fw-semibold mb-1">{{ item.title }}</h6>
                    <small class="text-muted">ID: {{ item.id }}</small>
                  </div>
                </td>

                <!-- Price -->
                <td>
                  <span class="price-badge">{{ item.price.toFixed(2) }}$</span>
                </td>

                <!-- Quantity Controls -->
                <td>
                  <div class="quantity-control">
                    <button
                      class="qty-btn"
                      @click="decreaseQuantity(item)"
                      :disabled="item.quantity <= 1"
                      title="Giảm số lượng"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      v-model.number="item.quantity"
                      class="qty-input"
                      min="1"
                      @change="validateQuantity(item)"
                    />
                    <button
                      class="qty-btn"
                      @click="increaseQuantity(item)"
                      title="Tăng số lượng"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </td>

                <!-- Total Price -->
                <td class="text-end">
                  <span class="total-price">{{ (item.price * item.quantity).toFixed(2) }}$</span>
                </td>

                <!-- Remove Button -->
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeItem(item)"
                    title="Xóa sản phẩm"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cart Summary -->
        <div class="row mt-5">
          <div class="col-md-8"></div>
          <div class="col-md-4">
            <div class="cart-summary">
              <div class="summary-row">
                <span>Tổng tiền hàng:</span>
                <span>{{ cart.totalPrice.toFixed(2) }}$</span>
              </div>
              <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <span class="text-success">Miễn phí</span>
              </div>
              <hr />
              <div class="summary-row final">
                <span class="fw-bold">Tổng cộng:</span>
                <span class="total-amount">{{ cart.totalPrice.toFixed(2) }}$</span>
              </div>

              <div class="d-grid gap-2 mt-4">
                <button class="btn btn-danger btn-lg fw-semibold" @click="handleCheckout">
                  <i class="bi bi-credit-card me-2"></i>Tiến Hành Thanh Toán
                </button>
                <button class="btn btn-outline-secondary" @click="continueShoppingModal = true">
                  <i class="bi bi-arrow-left me-2"></i>Tiếp Tục Mua Sắm
                </button>
              </div>

              <button
                class="btn btn-outline-danger w-100 mt-2"
                @click="clearCartConfirm"
              >
                <i class="bi bi-trash me-2"></i>Xóa Toàn Bộ Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="empty-cart text-center py-5">
        <div class="empty-icon mb-4">
          <i class="bi bi-cart-x"></i>
        </div>
        <h3 class="fw-bold mb-2">Giỏ Hàng Trống</h3>
        <p class="text-muted mb-4">Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá bộ sưu tập của chúng tôi!</p>
        <router-link to="/product" class="btn btn-danger btn-lg">
          <i class="bi bi-shop me-2"></i>Mua Sắm Ngay
        </router-link>
      </div>
    </div>
  </div>

  <!-- Checkout Modal -->
  <div class="modal fade show" tabindex="-1" style="display: block;" v-if="showModal">
    <div class="modal-backdrop fade show" @click="showModal = false"></div>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-danger text-white border-0">
          <h5 class="modal-title fw-bold">Thông Tin Thanh Toán</h5>
          <button type="button" class="btn-close btn-close-white" @click="showModal = false"></button>
        </div>
        <div class="modal-body p-4">
          <form @submit.prevent="confirmPayment">
            <div v-if="errorMsg" class="alert alert-danger border-0 rounded-3 mb-4">
              <i class="bi bi-exclamation-circle me-2"></i>
              {{ errorMsg }}
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Họ và Tên</label>
              <input
                type="text"
                class="form-control form-control-lg input-focus"
                v-model="fullName"
                placeholder="Nhập họ tên đầy đủ"
                required
              />
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Địa Chỉ Giao Hàng</label>
              <input
                type="text"
                class="form-control form-control-lg input-focus"
                v-model="address"
                placeholder="Nhập địa chỉ giao hàng"
                required
              />
            </div>

            <div class="mb-4">
              <label class="form-label fw-semibold">Số Điện Thoại</label>
              <input
                type="tel"
                class="form-control form-control-lg input-focus"
                v-model="phone"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div class="order-summary mb-4 p-3 bg-light rounded-3">
              <div class="d-flex justify-content-between mb-2">
                <span>Tổng tiền:</span>
                <span class="fw-bold">{{ cart.totalPrice.toFixed(2) }}$</span>
              </div>
              <small class="text-muted">Phí vận chuyển: Miễn phí</small>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-danger btn-lg fw-semibold" :disabled="loading">
                <i class="bi bi-check-circle me-2"></i>
                {{ loading ? 'Đang Xử Lý...' : 'Xác Nhận Thanh Toán' }}
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="showModal = false" :disabled="loading">
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Continue Shopping Modal -->
  <div class="modal fade show" tabindex="-1" style="display: block;" v-if="continueShoppingModal">
    <div class="modal-backdrop fade show" @click="continueShoppingModal = false"></div>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-info text-white border-0">
          <h5 class="modal-title fw-bold">Tiếp Tục Mua Sắm?</h5>
          <button type="button" class="btn-close btn-close-white" @click="continueShoppingModal = false"></button>
        </div>
        <div class="modal-body text-center p-4">
          <i class="bi bi-bag-check" style="font-size: 3rem; color: #0d6efd;"></i>
          <p class="mt-3 text-muted">Khám phá thêm những sản phẩm tuyệt vời khác từ bộ sưu tập của chúng tôi</p>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-secondary" @click="continueShoppingModal = false">Đóng</button>
          <router-link to="/product" class="btn btn-info fw-semibold">Mua Sắm Ngay</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-wrapper {
  background: #f9fafb;
  min-height: 100vh;
}

.cart-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e7eb;
}

.cart-header h1 {
  color: #111827;
  font-size: 2.5rem;
}

.cart-table-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.cart-table {
  margin-bottom: 0;
  border: none;
}

.cart-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.cart-table thead th {
  color: #374151;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 12px;
  border: none;
}

.cart-item-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.cart-item-row:hover {
  background-color: #f9fafb;
}

.cart-item-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  background: #f0f0f0;
}

.product-info h6 {
  color: #111827;
  font-size: 0.95rem;
}

.product-info small {
  color: #9ca3af;
}

.price-badge {
  background: #fef3f2;
  color: #dc2626;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9fafb;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: fit-content;
}

.qty-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.qty-btn:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #d1d5db;
}

.qty-input {
  width: 50px;
  height: 36px;
  border: none;
  text-align: center;
  font-weight: 600;
  color: #111827;
  background: transparent;
}

.qty-input:focus {
  outline: none;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.total-price {
  color: #111827;
  font-weight: 700;
  font-size: 1rem;
}

.cart-summary {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  position: sticky;
  top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #374151;
  font-size: 0.95rem;
}

.summary-row.final {
  font-size: 1.1rem;
  color: #111827;
}

.total-amount {
  color: #dc2626;
  font-size: 1.5rem;
  font-weight: 700;
}

.empty-cart {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
}

.empty-cart h3 {
  color: #111827;
  font-size: 1.5rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.input-focus {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-focus:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  outline: none;
}

.order-summary {
  border-left: 3px solid #dc2626;
}

@media (max-width: 768px) {
  .cart-header h1 {
    font-size: 1.75rem;
  }

  .cart-table-container {
    padding: 16px;
  }

  .cart-table thead th {
    padding: 12px 8px;
    font-size: 0.8rem;
  }

  .cart-table-container .table-responsive {
    overflow-x: auto;
  }

  .cart-summary {
    position: static;
    margin-top: 20px;
  }

  .quantity-control {
    width: 100%;
  }

  .qty-btn,
  .qty-input {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .cart-header {
    padding: 20px 0;
  }

  .cart-header h1 {
    font-size: 1.5rem;
  }

  .cart-table thead th {
    font-size: 0.75rem;
    padding: 10px 6px;
  }

  .cart-item-img {
    width: 50px;
    height: 50px;
  }

  .product-info h6 {
    font-size: 0.85rem;
  }
}
</style>
