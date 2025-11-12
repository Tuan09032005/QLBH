<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { useRouter } from 'vue-router'

const cart = useCartStore()
const showModal = ref(false)
const isLoggedIn = ref(false)
const router = useRouter()

const increaseQuantity = (item) => {
  item.quantity++
}
const decreaseQuantity = (item) => {
  if (item.quantity > 1) item.quantity--
}

const confirmPayment = () => {
  alert('✅ Đặt hàng thành công!')
  cart.clearCart()
  showModal.value = false
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
  const userData = JSON.parse(localStorage.getItem('user'))
  if (userData?.isLoggedIn) {
    isLoggedIn.value = true
  }
})
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-4">🛒 Giỏ hàng</h2>

    <table class="table table-hover align-middle" v-if="cart.items.length > 0">
      <thead class="table-dark">
        <tr>
          <th>Ảnh</th>
          <th>Tên sản phẩm</th>
          <th>Giá</th>
          <th class="text-center">Số lượng</th>
          <th>Tổng</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in cart.items" :key="item.id">
          <td><img :src="item.image" height="50" /></td>
          <td>{{ item.title }}</td>
          <td>{{ item.price.toFixed(2) }}$</td>
          <td class="text-center">
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary" @click="decreaseQuantity(item)">−</button>
              <span class="px-2">{{ item.quantity }}</span>
              <button class="btn btn-sm btn-outline-secondary" @click="increaseQuantity(item)">+</button>
            </div>
          </td>
          <td>{{ (item.price * item.quantity).toFixed(2) }}$</td>
          <td>
            <button
              class="btn btn-sm btn-danger"
              @click="() => { cart.removeItem(item.id); alert(`🗑️ Đã xóa '${item.title}' khỏi giỏ hàng`) }"
            >
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="alert alert-info text-center">
      Giỏ hàng đang trống. <a href="/product">Thêm sản phẩm?</a>
    </div>

    <div v-if="cart.items.length > 0" class="text-end mt-4">
      <h5>Tổng cộng: <strong>{{ cart.totalPrice.toFixed(2) }}$</strong></h5>
      <button class="btn btn-success me-2" @click="handleCheckout">Thanh toán</button>
      <button class="btn btn-warning" @click="() => { cart.clearCart(); alert('🧹 Đã xóa toàn bộ giỏ hàng.') }">
        Xóa toàn bộ
      </button>
    </div>
  </div>

  <!-- Modal thanh toán -->
  <div class="modal fade show" tabindex="-1" style="display: block;" v-if="showModal">
    <div class="modal-backdrop fade show" @click="showModal = false"></div>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Thông tin thanh toán</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="confirmPayment">
            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Địa chỉ giao hàng</label>
              <input type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" required />
            </div>
            <div class="text-end">
              <button type="submit" class="btn btn-primary">Xác nhận thanh toán</button>
              <button type="button" class="btn btn-secondary ms-2" @click="showModal = false">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  z-index: 1000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}
</style>
