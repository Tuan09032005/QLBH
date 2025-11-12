<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import { useCartStore } from '@/stores/cart.js'

const route = useRoute()
const cart = useCartStore()

const product = ref(null)
const quantity = ref(1)

onMounted(async () => {
  const id = route.params.id
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Lỗi khi load sản phẩm:', error.message)
  } else {
    product.value = data
  }
})

const addToCart = () => {
  if (product.value && quantity.value > 0) {
    cart.addToCart(product.value, quantity.value)
  }
}
</script>

<template>
  <div class="container mt-5" v-if="product">
    <div class="row gx-5">
      <div class="col-md-5 d-flex justify-content-center align-items-center">
        <img 
          :src="product.image" 
          alt="Product image" 
          class="img-fluid rounded shadow-sm" 
          style="max-height: 400px; object-fit: contain;"
        />
      </div>
      <div class="col-md-7">
        <h2 class="mb-3">{{ product.title }}</h2>
        <p class="text-secondary fst-italic mb-2">Danh mục: {{ product.category }}</p>
        <p class="mb-4" style="min-height: 100px;">{{ product.description || 'Không có mô tả.' }}</p>

        <h3 class="text-danger mb-3">{{ product.price.toFixed(2) }} $</h3>

        <p class="mb-4">
          <strong>Đánh giá: </strong> 
          <span class="text-warning">{{ product.rating__rate || 0 }} ⭐</span> ({{ product.rating__count || 0 }} đánh giá)
        </p>

        <div class="d-flex align-items-center mb-4">
          <label for="quantity" class="form-label me-3 fw-semibold" style="min-width: 80px;">Số lượng:</label>
          <div class="input-group" style="width: 120px;">
            <button 
              class="btn btn-outline-secondary" 
              type="button" 
              @click="quantity > 1 && quantity--"
            >-</button>
            <input 
              type="text" 
              id="quantity" 
              v-model.number="quantity" 
              class="form-control text-center" 
              readonly
            />
            <button 
              class="btn btn-outline-secondary" 
              type="button" 
              @click="quantity++"
            >+</button>
          </div>
        </div>

        <button 
          class="btn btn-primary btn-lg px-4" 
          @click="addToCart"
        >
          <i class="bi bi-cart-plus me-2"></i> Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center mt-5 text-muted">
    <p>Không tìm thấy sản phẩm hoặc đang tải...</p>
  </div>
</template>
