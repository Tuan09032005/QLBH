<template>
  <div class="home-category-banners mt-4" aria-hidden="false">
    <div class="row g-3">
      <div class="col-12 col-md-4">
        <router-link class="cat-link" :to="{ name: 'product', query: { category: 'đồ bóng đá' } }" aria-label="Xem sản phẩm Đồ Bóng Đá">
          <div class="cat-banner position-relative rounded-3 overflow-hidden">
            <img src="/images/banner_1.jpg" alt="Đồ bóng đá" class="w-100 h-100 object-cover" loading="lazy" decoding="async" />
            <div class="banner-gradient"></div>
            <div class="banner-info">
              <h3 class="banner-title">Đồ Bóng Đá</h3>
              <p class="banner-sub">Áo, quần, đồng phục đội</p>
              <span class="banner-cta">Xem ngay</span>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-12 col-md-4">
        <router-link class="cat-link" :to="{ name: 'product', query: { category: 'giày bóng đá' } }" aria-label="Xem sản phẩm Giày Bóng Đá">
          <div class="cat-banner position-relative rounded-3 overflow-hidden">
            <img src="/images/banner2.jpg" alt="Giày bóng đá" class="w-100 h-100 object-cover" loading="lazy" decoding="async" />
            <div class="banner-gradient"></div>
            <div class="banner-info">
              <h3 class="banner-title">Giày Bóng Đá</h3>
              <p class="banner-sub">Công nghệ nâng đệm, bám sân</p>
              <span class="banner-cta">Xem ngay</span>
            </div>
          </div>
        </router-link>
      </div>

      <div class="col-12 col-md-4">
        <router-link class="cat-link" :to="{ name: 'product', query: { category: 'phụ kiện bóng đá' } }" aria-label="Xem sản phẩm Phụ Kiện Bóng Đá">
          <div class="cat-banner position-relative rounded-3 overflow-hidden">
            <img src="/images/183397-ddbzazsotj-1669366428.jpg" alt="Phụ kiện bóng đá" class="w-100 h-100 object-cover" loading="lazy" decoding="async" />
            <div class="banner-gradient"></div>
            <div class="banner-info">
              <h3 class="banner-title">Phụ Kiện Bóng Đá</h3>
              <p class="banner-sub">Tất, túi, phụ kiện huấn luyện</p>
              <span class="banner-cta">Xem ngay</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// simple presentational component; no props needed for now
</script>

<style scoped>
.home-category-banners {
  --card-radius: 14px;
  --shadow: 0 10px 30px rgba(2,6,23,0.08);
  --accent: #dc2626;
}

.home-category-banners .cat-link { display:block; border-radius: var(--card-radius); }
.home-category-banners .cat-banner {
  height: 180px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--card-radius);
  overflow: hidden;
  position: relative;
  transition: transform 0.36s cubic-bezier(.2,.9,.2,1), box-shadow 0.28s ease;
}

.home-category-banners .cat-banner img.object-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform-origin: center center;
  transition: transform 0.6s ease, filter 0.4s ease;
  will-change: transform;
}

.home-category-banners .banner-gradient {
  position: absolute; inset:0; z-index: 2;
  background: linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.48) 100%);
  mix-blend-mode: multiply;
}

.home-category-banners .banner-info {
  position: absolute; z-index: 3; inset: 0; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; padding: 18px;
  color: #fff;
}

.home-category-banners .banner-title {
  font-size: 1.15rem; font-weight: 800; letter-spacing: 0.4px; margin: 0; text-shadow: 0 3px 18px rgb(240, 239, 239);
}

.home-category-banners .banner-sub { margin: 6px 0 12px; font-size: 0.9rem; opacity: 0.9 }

.home-category-banners .banner-cta {
  display:inline-block; background: rgba(19, 19, 19, 0); color: #fff; padding: 8px 14px; border-radius: 999px; font-weight:700; font-size:0.9rem; border: 1px solid rgba(255,255,255,0.08);
  transition: background 0.18s ease, transform 0.12s ease;
}

.home-category-banners .cat-link:focus-visible { outline: 3px solid rgba(220,38,38,0.12); outline-offset: 6px; border-radius: var(--card-radius); }
.home-category-banners .cat-link:hover .cat-banner { transform: translateY(-8px); box-shadow: var(--shadow); }
.home-category-banners .cat-link:hover img.object-cover { transform: scale(1.06); filter: saturate(1.06) contrast(1.02); }
.home-category-banners .cat-link:hover .banner-cta { background: var(--accent); transform: translateY(-2px); }

@media (max-width: 992px) {
  .home-category-banners .cat-banner { height: 150px }
}

@media (max-width: 576px) {
  .home-category-banners .cat-banner { height: 120px }
  .home-category-banners .banner-title { font-size: 1rem }
}
</style>
