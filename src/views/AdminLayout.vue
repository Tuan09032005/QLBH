<template>
  <div class="d-flex" style="min-height: 100vh;">
    <!-- Sidebar -->
    <nav id="sidebarMenu" class="d-lg-block bg-dark text-white p-3" style="width: 250px;">
      <h3 class="text-center text-success fw-bold mb-4">SPORTY7</h3>

      <ul class="nav flex-column">
        <li class="nav-item mb-2">
          <router-link to="/admin" class="nav-link text-white">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </router-link>
        </li>
        <li class="nav-item mb-2">
          <router-link to="/admin/product" class="nav-link text-white">
            <i class="bi bi-box-seam me-2"></i>Quản lý sản phẩm
          </router-link>
        </li>
        <li class="nav-item mb-2">
          <router-link to="/admin/employee" class="nav-link text-white">
            <i class="bi bi-person-badge me-2"></i>Quản lý nhân viên
          </router-link>
        </li>
        <li class="nav-item mb-2">
          <router-link to="/admin/orders" class="nav-link text-white">
            <i class="bi bi-cart-check me-2"></i>Quản lý đơn hàng
          </router-link>
        </li>
      </ul>

      <hr />

      <button class="btn btn-outline-light w-100" @click="logout">
        <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
      </button>
    </nav>

    <!-- Nội dung chính -->
    <main class="flex-grow-1 bg-light p-3">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
