<template>
  <div class="container mt-5 mb-5">
    <!-- Phần tiêu đề -->
    <div class="text-center mb-4">
      <h2 class="fw-bold text-info">Liên hệ với chúng tôi</h2>
      <p class="text-muted">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
    </div>

    <!-- Phần liên hệ và bản đồ -->
    <div class="row g-4">
      <!-- Form liên hệ -->
      <div class="col-md-6">
        <div class="card p-4 shadow-sm border-0 h-100">
          <h5 class="mb-4 text-info"><i class="bi bi-envelope-fill me-2"></i>Gửi tin nhắn</h5>
          <form @submit.prevent="guiLienHe">
            <div class="mb-3">
              <label for="ten" class="form-label">Họ và tên</label>
              <input v-model="form.ten" type="text" id="ten" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input v-model="form.email" type="email" id="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="noidung" class="form-label">Nội dung</label>
              <textarea v-model="form.noidung" id="noidung" rows="5" class="form-control" required></textarea>
            </div>
            <div class="d-grid">
              <button class="btn btn-info" type="submit">Gửi liên hệ</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bản đồ -->
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.211790010516!2d106.70748841474956!3d10.794285892309753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a865c51417%3A0xb1a948ba4f86c395!2zQ8O0bmcgdHkgVE5ISCBQaMO6IFRo4buRIFRow6BuaCBUUC5IQ00!5e0!3m2!1svi!2s!4v1685283243736!5m2!1svi!2s"
            width="100%" height="100%" style="border:0; border-radius: 0 0 8px 8px;" allowfullscreen="" loading="lazy">
          </iframe>
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
        aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
        </div>
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
.card {
  border-radius: 12px;
}

h2 {
  font-size: 2rem;
}

label {
  font-weight: 500;
}
</style>
