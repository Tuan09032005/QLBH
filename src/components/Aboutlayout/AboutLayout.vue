<template>
  <!-- Hero Section -->
  <section class="hero-section py-5 mb-5">
    <div class="container">
      <div class="text-center">
        <h1 class="display-4 fw-bold mb-3">SPORTY7</h1>
        <p class="lead text-muted mb-2">Cửa hàng thể thao hàng đầu tại Việt Nam</p>
        <p class="text-secondary">Chuyên cung cấp sản phẩm thể thao chính hãng, giá cạnh tranh</p>
      </div>
    </div>
  </section>

  <!-- About Team Section -->
  <section class="about-section py-5">
    <div class="container">
      <div class="row mb-5">
        <div class="col-lg-8 mx-auto">
          <h2 class="display-6 fw-bold text-center mb-4">Về Nhóm Phát Triển</h2>
          <p class="lead text-center text-muted mb-4">
            Dự án SPORTY7 được phát triển bởi nhóm sinh viên tài năng dưới sự hướng dẫn của thầy Cao Huân.
          </p>
          <div class="team-intro p-4 bg-light rounded-3">
            <p class="mb-3">
              <strong>Giảng viên hướng dẫn:</strong> Thầy Cao Huấn
            </p>
            <p class="mb-0">
              <strong>Thành viên nhóm:</strong> Phạm Tuân, Nguyễn Công Hảo, Quang Vinh, Lord Chí Khang
            </p>
          </div>
        </div>
      </div>

      <!-- Admin Team Cards -->
      <div class="mt-5 pt-4">
        <h3 class="text-center fw-bold mb-5">Đội Quản Lý Hệ Thống</h3>
        <div class="row g-4">
          <div
            class="col-md-6 col-lg-3 mb-4"
            v-for="admin in admins"
            :key="admin.id"
          >
            <div class="card admin-card h-100 border-0 shadow-sm">
              <div class="card-img-wrapper position-relative overflow-hidden">
                <img
                  :src="admin.avatar"
                  class="card-img-top"
                  alt="Avatar"
                  style="height: 280px; object-fit: cover"
                />
                <div class="card-overlay"></div>
                <div class="role-badge">Admin</div>
              </div>
              <div class="card-body text-center">
                <h5 class="card-title fw-bold mb-2">{{ admin.name }}</h5>
                <div class="card-info text-muted small">
                  <p class="mb-2">
                    <i class="bi bi-envelope me-2"></i>
                    <span>{{ admin.email }}</span>
                  </p>
                  <p class="mb-0">
                    <i class="bi bi-telephone me-2"></i>
                    <span>{{ admin.phone }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

const admins = ref([])

const fetchAdmins = async () => {
  const { data, error } = await supabase
    .from("login")
    .select("id, name, phone, role")
    .eq("role", "admin")

  if (!error) {
    const { data: allUsers } = await supabase.auth.admin.listUsers()
    admins.value = data.map((admin) => {
      const user = allUsers.users.find((u) => u.id === admin.id)
      const email = user?.email || 'unknown@example.com'

      return {
        ...admin,
        email,
        
        avatar: `https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/03/28/12/cristiano-ronaldo.jpg?width=1200&height=1200&fit=crop`,
      }
    })
  }
}

onMounted(fetchAdmins)
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e7eb;
}

.hero-section h1 {
  color: #111827;
  font-size: 3rem;
  letter-spacing: -1px;
}

.team-intro {
  border-left: 4px solid #dc2626;
  line-height: 1.8;
}

.team-intro p {
  margin-bottom: 0.75rem;
  color: #374151;
}

.admin-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.admin-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

.card-img-wrapper {
  position: relative;
  height: 280px;
  background: #f0f0f0;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%);
}

.role-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #dc2626;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2;
}

.card-body {
  padding: 24px 16px;
}

.card-title {
  color: #111827;
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.card-info {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.card-info p {
  color: #6b7280;
  font-size: 0.9rem;
}

.card-info i {
  color: #dc2626;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .admin-card {
    margin-bottom: 20px;
  }

  .card-img-wrapper {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 40px 20px !important;
  }

  .hero-section h1 {
    font-size: 1.75rem;
  }

  .hero-section .lead {
    font-size: 1rem;
  }

  .team-intro {
    padding: 20px !important;
  }
}
</style>
