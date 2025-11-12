<template>
  <section class="mb-5">
    <h3 class="mb-3"><i class="bi bi-menu-app text-danger"></i> Gợi ý hôm nay</h3>
    <div class="row">
      <div v-for="p in products" :key="p.id" class="col-6 col-md-3 mb-4">
        <div class="card h-100 shadow-sm product-card hover-scale">
          <img :src="p.image" class="card-img-top" style="height: 180px; object-fit: contain;" />
          <div class="card-body">
            <h6 class="card-title">{{ p.title }}</h6>
            <p class="mb-1 fw-bold">{{ p.price }} $</p>
            <p class="text-muted">⭐ {{ p.rating?.rate }}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
             <button class="btn btn-sm btn-outline-warning" @click="goToDetail(p.id)">Chi tiết</button>
            <button class="btn btn-sm btn-danger" @click="addToCart(p)">Thêm</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps(['products'])
const emit = defineEmits(['goToDetail', 'addToCart'])

const goToDetail = (id) => emit('goToDetail', id)
const addToCart = (p) => emit('addToCart', p)
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
</style>
