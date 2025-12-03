<template>
  <section class="hero-new py-5">
    <div class="container">
      <div class="row align-items-center">
        <!-- Left: content -->
        <div class="col-lg-6 hero-content mb-4 mb-lg-0">
          <h1 class="display-5 fw-bold">SPORTY7 — Gear cho mọi điều kiện</h1>
          <p class="lead text-muted mb-4">Sản phẩm chính hãng, giá cạnh tranh, giao hàng nhanh. Khám phá bộ sưu tập mới nhất ngay hôm nay.</p>

          <form class="d-flex hero-search mb-3" @submit.prevent="onSearch">
            <input v-model="query" type="search" class="form-control me-2" placeholder="Tìm sản phẩm, ví dụ: giày chạy" aria-label="Search products" />
            <button class="btn btn-danger">Tìm kiếm</button>
          </form>

          <div class="d-flex gap-2 mb-3">
            <router-link to="/product" class="btn btn-brand btn-lg">Xem sản phẩm</router-link>
            <router-link to="/about" class="btn btn-outline-brand btn-lg">Về chúng tôi</router-link>
          </div>

          <div class="features d-flex flex-wrap gap-3 mt-3">
            <div class="feature p-2 d-flex align-items-center">
              <i class="bi bi-truck fs-4 me-2"></i>
              <div>
                <div class="small text-muted">Giao hàng</div>
                <div class="fw-semibold">Nhanh trong ngày</div>
              </div>
            </div>

            <div class="feature p-2 d-flex align-items-center">
              <i class="bi bi-award fs-4 me-2"></i>
              <div>
                <div class="small text-muted">Bảo đảm</div>
                <div class="fw-semibold">Chính hãng 100%</div>
              </div>
            </div>

            <div class="feature p-2 d-flex align-items-center">
              <i class="bi bi-shield-check fs-4 me-2"></i>
              <div>
                <div class="small text-muted">Hỗ trợ</div>
                <div class="fw-semibold">Đổi trả 30 ngày</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: media -->
        <div class="col-lg-6 hero-media">
          <div class="hero-image rounded shadow-sm" role="img" aria-label="Hero image">
            <img src="https://mir-s3-cdn-cf.behance.net/projects/404/12899a152630613.Y3JvcCw4MDgsNjMyLDAsMA.jpg" alt="Sporty athletes with gear" class="img-fluid rounded hero-img" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const query = ref('')
const router = useRouter()

const onSearch = () => {
  if (!query.value) {
    router.push('/product')
  } else {
    // navigate to product with query param (Product listing should read this if implemented)
    router.push({ path: '/product', query: { q: query.value } })
  }
}
</script>

<style scoped>
.hero-new {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%);
}
.hero-content h1 {
  color: #111827;
}
.hero-search .form-control {
  min-width: 0;
}
.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(239,68,68,0.04));
  overflow: hidden;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.features .feature {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 8px;
  min-width: 160px;
}

@media (max-width: 767.98px) {
  .hero-image { height: 220px; }
  .hero-content { text-align: center; }
  .features { justify-content: center; }
}
</style>