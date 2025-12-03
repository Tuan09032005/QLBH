<template>
  <!-- Hero Section -->
  <section class="hero-section py-5 mb-5">
    <div class="container">
      <div class="text-center">
        <h1 class="display-5 fw-bold mb-3">Liên Hệ Với Chúng Tôi</h1>
        <p class="lead text-muted mb-0">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7</p>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <div class="container mb-5">
    <div class="row g-4">
      <!-- Contact Form -->
      <div class="col-lg-6 mb-4">
        <div class="contact-card p-5 rounded-4 shadow-sm border-0 h-100">
          <div class="form-header mb-4">
            <h3 class="fw-bold mb-2"><i class="bi bi-envelope-fill text-danger me-2"></i>Gửi Tin Nhắn</h3>
            <p class="text-muted">Hãy cho chúng tôi biết bạn cần gì</p>
          </div>

          <form @submit.prevent="guiLienHe">
            <div class="mb-4">
              <label for="ten" class="form-label fw-semibold text-dark">Họ và Tên</label>
              <input
                v-model="form.ten"
                type="text"
                id="ten"
                class="form-control form-control-lg contact-input"
                placeholder="Nhập tên đầy đủ của bạn"
                required
              />
            </div>

            <div class="mb-4">
              <label for="email" class="form-label fw-semibold text-dark">Email</label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                class="form-control form-control-lg contact-input"
                placeholder="Nhập địa chỉ email của bạn"
                required
              />
            </div>

            <div class="mb-4">
              <label for="noidung" class="form-label fw-semibold text-dark">Nội Dung</label>
              <textarea
                v-model="form.noidung"
                id="noidung"
                rows="5"
                class="form-control form-control-lg contact-input"
                placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                required
              ></textarea>
            </div>

            <div class="d-grid">
              <button class="btn btn-danger btn-lg fw-semibold" type="submit">
                <i class="bi bi-send-fill me-2"></i>Gửi Liên Hệ
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Contact Info & Map -->
      <div class="col-lg-6">
        <!-- Contact Info Cards -->
        <div class="mb-4">
          <div class="info-card p-4 rounded-3 mb-3 border-0 shadow-sm">
            <div class="d-flex align-items-start">
              <div class="info-icon me-3">
                <i class="bi bi-telephone-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-1">Số Điện Thoại</h5>
                <p class="text-muted mb-0">+84 (0)123 456 789</p>
              </div>
            </div>
          </div>

          <div class="info-card p-4 rounded-3 mb-3 border-0 shadow-sm">
            <div class="d-flex align-items-start">
              <div class="info-icon me-3">
                <i class="bi bi-envelope-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-1">Email</h5>
                <p class="text-muted mb-0">support@sporty7.com</p>
              </div>
            </div>
          </div>

          <div class="info-card p-4 rounded-3 border-0 shadow-sm">
            <div class="d-flex align-items-start">
              <div class="info-icon me-3">
                <i class="bi bi-geo-alt-fill"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-1">Địa Chỉ</h5>
                <p class="text-muted mb-0">123 Đường Thể Thao, TP. Hồ Chí Minh, Việt Nam</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="map-container rounded-4 overflow-hidden shadow-sm border-0">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.211790010516!2d106.70748841474956!3d10.794285892309753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a865c51417%3A0xb1a948ba4f86c395!2zQ8O0bmcgdHkgVE5ISCBQaMO6IFRo4buRIFRow6BuaCBUUC5IQ00!5e0!3m2!1svi!2s!4v1685283243736!5m2!1svi!2s"
            width="100%"
            height="300"
            style="border: 0"
            allowfullscreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast thông báo -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      v-if="toast.show"
      class="toast align-items-center text-bg-success border-0 show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-check-circle-fill me-2"></i>
          {{ toast.message }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  ten: '',
  email: '',
  noidung: ''
})

const toast = ref({
  show: false,
  message: ''
})

const guiLienHe = () => {
  if (form.value.ten && form.value.email && form.value.noidung) {
    toast.value.message = 'Liên hệ của bạn đã được gửi!'
    toast.value.show = true
    form.value.ten = ''
    form.value.email = ''
    form.value.noidung = ''
    setTimeout(() => toast.value.show = false, 4000)
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e5e7eb;
}

.hero-section h1 {
  color: #111827;
  font-size: 2.5rem;
  letter-spacing: -1px;
}

.contact-card {
  background: white;
  border: 1px solid #e5e7eb;
}

.form-header {
  border-bottom: 2px solid #dc2626;
  padding-bottom: 16px;
}

.form-header h3 {
  color: #111827;
  font-size: 1.5rem;
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.contact-input {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.contact-input:focus {
  border-color: #dc2626;
  background: white;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  outline: none;
}

.contact-input::placeholder {
  color: #9ca3af;
}

.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fef2f2;
  border-radius: 10px;
  color: #dc2626;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-card h5 {
  color: #111827;
  font-size: 1.1rem;
}

.info-card p {
  font-size: 0.95rem;
  color: #6b7280;
}

.map-container {
  height: 100%;
  min-height: 300px;
}

.map-container iframe {
  border-radius: 16px;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 1.8rem;
  }

  .contact-card {
    padding: 30px !important;
  }

  .contact-input {
    padding: 10px 14px;
    font-size: 0.95rem;
  }

  .map-container {
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 30px 20px !important;
  }

  .hero-section h1 {
    font-size: 1.5rem;
  }

  .contact-card {
    padding: 20px !important;
  }

  .form-header h3 {
    font-size: 1.2rem;
  }
}
</style>
