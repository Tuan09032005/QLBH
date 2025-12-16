<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { supabase } from '@/supabase.js'

const cart = useCartStore()

const increaseQty = (item) => {
  const next = (item.quantity || 0) + 1
  cart.updateQuantity(item.id, next)
}

const decreaseQty = (item) => {
  const next = Math.max(0, (item.quantity || 0) - 1)
  cart.updateQuantity(item.id, next)
}

const setQty = (item, val) => {
  const v = Math.max(0, parseInt(val, 10) || 0)
  cart.updateQuantity(item.id, v)
}

const deleteItem = (id) => {
  if (confirm('Xóa sản phẩm khỏi giỏ hàng?')) cart.removeItem(id)
}

const showModal = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const fullName = ref('')
const address = ref('')
const phone = ref('')

const paymentMethod = ref('cod')
const card = ref({
  number: '',
  name: '',
  exp: '',
  cvv: ''
})

let userId = null
let creatingOrder = false
const orderCooldown = 10000
let lastOrderTime = 0

// ================== GIẢ LẬP THANH TOÁN THẺ ==================
const fakeCardPayment = () => {
  return (
    card.value.number === '1111111111111111' &&
    card.value.cvv.length === 3 &&
    card.value.name.trim() &&
    card.value.exp.trim()
  )
}

// ================== CONFIRM PAYMENT ==================
const confirmPayment = async () => {
  if (creatingOrder) return
  creatingOrder = true
  errorMsg.value = ''

  if (!fullName.value || !address.value || !phone.value) {
    errorMsg.value = 'Vui lòng điền đầy đủ thông tin.'
    creatingOrder = false
    return
  }

  const now = Date.now()
  if (now - lastOrderTime < orderCooldown) {
    errorMsg.value = 'Bạn thao tác quá nhanh, vui lòng chờ.'
    creatingOrder = false
    return
  }

  // 👉 Nếu chọn THẺ → kiểm tra giả lập
  if (paymentMethod.value === 'card') {
    const success = fakeCardPayment()
    if (!success) {
      errorMsg.value = '❌ Thanh toán thẻ thất bại (dùng 1111111111111111 để test)'
      creatingOrder = false
      return
    }
  }

  loading.value = true

  const items = cart.items.map(i => ({
    id: i.id,
    title: i.title,
    price: i.price,
    quantity: i.quantity
  }))

  const order = {
    user_id: userId,
    items: JSON.stringify(items),
    total: cart.totalPrice,
    full_name: fullName.value,
    address: address.value,
    phone: phone.value,
    payment_method: paymentMethod.value,
    payment_status: paymentMethod.value === 'card' ? 'paid' : 'pending',
    created_at: new Date().toISOString()
  }

  const { error } = await supabase.from('orders').insert([order])

  if (error) {
    errorMsg.value = error.message
    loading.value = false
    creatingOrder = false
    return
  }

  alert('✅ Đặt hàng thành công!')
  lastOrderTime = now

  cart.clearCart()
  showModal.value = false
  fullName.value = address.value = phone.value = ''
  card.value = { number: '', name: '', exp: '', cvv: '' }

  loading.value = false
  creatingOrder = false
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?.id) userId = user.id
})
</script>

<template>
  <div class="container py-5">
    <h2 class="mb-4">🛒 Giỏ hàng</h2>

    <div v-if="cart.items.length">
      <div v-for="i in cart.items" :key="i.id" class="cart-item mb-3 p-3">
        <img :src="i.image" alt="" class="item-image" />

        <div class="item-body">
          <div class="d-flex justify-between align-center">
            <h5 class="item-title">{{ i.title }}</h5>
            <button class="btn btn-sm btn-outline-danger" @click="deleteItem(i.id)">Xóa</button>
          </div>

          <p class="item-price">Giá: <strong>{{ i.price.toFixed(2) }}$</strong></p>

          <div class="qty-row">
            <div class="qty-controls">
              <button class="qty-btn" @click="decreaseQty(i)">−</button>
              <input class="qty-input" type="number" min="0" v-model.number="i.quantity" @change="setQty(i, i.quantity)" />
              <button class="qty-btn" @click="increaseQty(i)">+</button>
            </div>

            <div class="item-subtotal">Subtotal: <strong>{{ (i.price * i.quantity).toFixed(2) }}$</strong></div>
          </div>
        </div>
      </div>

      <h4 class="mt-3">Tổng tiền: {{ cart.totalPrice.toFixed(2) }}$</h4>

      <button class="btn btn-danger mt-3 pay-btn" @click="showModal = true">
        Thanh toán
      </button>
    </div>

    <p v-else>Giỏ hàng trống</p>
  </div>

  <!-- MODAL -->
  <div v-if="showModal" class="modal-backdrop">
    <div class="modal-box">
      <h4>Thanh toán</h4>

      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <input class="form-control mb-2" placeholder="Họ tên" v-model="fullName" />
      <input class="form-control mb-2" placeholder="Địa chỉ" v-model="address" />
      <input class="form-control mb-3" placeholder="SĐT" v-model="phone" />

      <div class="mb-3">
        <label>
          <input type="radio" value="cod" v-model="paymentMethod" />
          COD
        </label>
        <br />
        <label>
          <input type="radio" value="card" v-model="paymentMethod" />
          Thẻ ngân hàng
        </label>
      </div>

      <div v-if="paymentMethod === 'card'" class="border p-3 mb-3">
        <input class="form-control mb-2" placeholder="Số thẻ" v-model="card.number" />
        <input class="form-control mb-2" placeholder="Tên chủ thẻ" v-model="card.name" />
        <input class="form-control mb-2" placeholder="MM/YY" v-model="card.exp" />
        <input class="form-control" placeholder="CVV" v-model="card.cvv" />
        <small>Dùng số thẻ <b>1111111111111111</b> để test</small>
      </div>

      <button class="btn btn-success w-100" @click="confirmPayment" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Xác nhận' }}
      </button>

      <button class="btn btn-secondary w-100 mt-2" @click="showModal = false">
        Hủy
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-box {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 8px;
}

.cart-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
}
.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.item-body {
  flex: 1;
}
.item-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  line-height: 1.2;
}
.item-price {
  margin: 0 0 8px 0;
  color: #333;
}
.qty-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.qty-controls {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}
.qty-btn {
  background: #f5f5f5;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 18px;
}
.qty-btn:hover { background: #ececec }
.qty-input {
  width: 56px;
  padding: 6px 8px;
  border: none;
  text-align: center;
}
.item-subtotal {
  font-size: 14px;
  color: #222;
}
.pay-btn {
  min-width: 180px;
}

@media (max-width: 600px) {
  .cart-item { flex-direction: column; align-items: center }
  .item-image { width: 140px; height: 140px }
  .qty-row { width: 100%; justify-content: center }
}
</style>
