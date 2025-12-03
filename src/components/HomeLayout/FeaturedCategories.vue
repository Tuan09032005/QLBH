<template>
  <section class="mb-5">
    <h3 class="mb-3">Danh mục nổi bật</h3>
    <div class="row text-center">
      <div v-for="cat in categories" :key="cat" class="col-6 col-md-3 mb-4">
        <!-- Bọc trong router-link -->
        <router-link 
          :to="`/product?category=${encodeURIComponent(cat)}`" 
          class="border rounded py-4 px-2 shadow-sm h-100 hover-scale text-decoration-none text-dark d-block"
        >
          <i class="bi bi-tag fs-2 text-danger"></i>
          <p class="mb-0 mt-2 fw-semibold">{{ cat }}</p>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps(['categories'])
</script>

<style scoped>
.hover-scale:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
</style>
