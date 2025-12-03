<template>
  <section class="hero-banner mb-4">
    <div class="hero-content container d-flex flex-column flex-md-row align-items-center justify-content-between">
      <div class="hero-text">
        <h1 class="hero-title">Khuyến mãi Lớn - Mua Ngay</h1>
        <p class="hero-sub">Ưu đãi tới 30% cho sản phẩm chọn lọc. Giao hàng nhanh, đổi trả dễ dàng.</p>
        <div class="mt-3">
          <button class="btn btn-danger btn-lg me-2">Mua Ngay</button>
          <button class="btn btn-outline-light btn-lg">Xem Thêm</button>
        </div>
      </div>
      <div class="hero-image d-none d-md-block">
        <img src="/images/183397-ddbzazsotj-1669366428.jpg" alt="Hero" />
      </div>
    </div>
  </section>
</template>

<script setup>
// Presentation-only hero banner
</script>

<style scoped>
.hero-banner { background: linear-gradient(90deg,#fff4f4 0%, #fff 100%); padding: 28px 0; border-radius: 10px; }
.hero-content { gap: 20px; }
.hero-title { font-family: Oswald, sans-serif; font-size: 32px; color: #9b111e; margin: 0 0 8px; }
.hero-sub { color: #5b5b5b; margin: 0; }
.hero-image img { width: 360px; max-width: 100%; height: auto; display:block; }
.hero-banner .btn-outline-light { border-color: rgba(255,255,255,0.6); color: #fff; }

@media (max-width: 767px) {
  .hero-title { font-size: 22px; }
  .hero-image { display: none; }
}
</style>
