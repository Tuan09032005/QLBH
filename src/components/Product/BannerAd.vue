<template>
  <div class="banner-ad d-flex gap-3 mb-4">
    <div class="banner-item flex-fill rounded">
      <img src="/images/banner1.svg" alt="Banner 1" />
    </div>
    <div class="banner-item flex-fill rounded d-none d-md-block">
      <img src="/images/banner2.svg" alt="Banner 2" />
    </div>
  </div>
</template>

<script setup>
// Simple horizontal banners. Small screens show only the first.
</script>

<style scoped>
.banner-ad { align-items: stretch; }
.banner-item img { width: 100%; height: 120px; object-fit: cover; display:block; border-radius: 10px; }
@media (min-width: 992px) { .banner-item img { height: 150px; } }
</style>
