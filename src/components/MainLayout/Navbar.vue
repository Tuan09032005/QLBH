<template>
  <!-- Navbar trên cùng -->
  <nav class="navbar bg-info fixed-top" style="height: 100px">
    <div
      class="container-fluid d-flex justify-content-between align-items-center"
    >
      <img
        src="@/assets/SPORTY7-removebg-preview.png"
        alt=""
        width="150px"
        height="100px"
      />
      <!-- //timkiem -->
      <div class="d-flex align-items-center mx-auto" style="width: 25%" role="search">
        
    <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" >

</div>
      <!-- ---- -->
      <div style="width: 20%; display: flex;color:white">
        <!-- Icon user -->
        <i
          class="bi bi-person-circle"
          @click="toggleUserMenu"
          style="font-size: 30px; cursor: pointer; margin-top: 20px"
        ></i>

        <!-- Menu dropdown -->
        <div
          v-if="showUserMenu"
          class="position-absolute bg-white shadow p-2 rounded"
          style="top: 20px; right: 350px; min-width: 150px; z-index: 10000"
        >
          <template v-if="isLoggedIn">
            <p class="mb-1">Hello: {{ displayName }}</p>
            <button class="btn btn-sm btn-outline-danger w-100" @click="logout">
              Đăng xuất
            </button>
          </template>
          <template v-else>
            <button
              class="btn btn-sm btn-outline-primary w-100"
              @click="goToLogin"
            >
              Đăng nhập
            </button>
          </template>
        </div>

        <!-- Giỏ hàng -->
        <router-link style="margin: 20px; position: relative;color: white;" to="/cart">
          <i
            class="bi bi-bag-check"
            style="font-size: 30px; cursor: pointer"
          ></i>
          <span
            v-if="cartCount > 0"
            class="badge bg-danger position-absolute top-0 start-100 translate-middle"
          >
            {{ cartCount }}
          </span>
        </router-link>
      </div>
    </div>
  </nav>

  <!-- Navbar thứ hai -->
  <nav class="navbar navbar-expand-lg bg-secondary fixed-top sticky-top" style="top: 100px;z-index: 1020; ">
    <div class="container-fluid">
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item" >
            <router-link to="/" class="nav-link">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/product" class="nav-link">Sản phẩm</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-link">Liên hệ</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link">Giới thiệu</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Nội dung trang chính -->
  <div style="padding-top: 200px">
    <router-view />
  </div>
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";


const router = useRouter();
const showUserMenu = ref(false);
const isLoggedIn = ref(false);
const displayName = ref("User");
const isAdmin = ref(false);

// Giỏ hàng
const cart = useCartStore();
const cartCount = computed(() =>
  cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

// Mở/đóng menu người dùng
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const goToLogin = () => {
  showUserMenu.value = false;
  router.push("/login");
};

const logout = () => {
  localStorage.removeItem("user");
  isLoggedIn.value = false;
  displayName.value = "";
  isAdmin.value = false;
  showUserMenu.value = false;
  router.push("/");
};
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem("user"));
  if (userData && userData.isLoggedIn) {
    isLoggedIn.value = true;
    displayName.value = userData.displayName || "User";
    isAdmin.value = userData.role === "admin";
  }
});
</script>

<style>
.navbar-nav .nav-link {
  color: white;
  position: relative;
  padding: 8px 16px;
  transition: color 0.3s ease;
}

/* Gạch chân ẩn ban đầu */
.navbar-nav .nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0; /* vị trí đường gạch */
  width: 0;
  height: 2px;
  background-color: #ffc107;
  transition: width 0.3s ease;
}

/* Hover: đổi màu + gạch chân chạy từ trái qua phải */
.navbar-nav .nav-link:hover {
  color: #ffc107;
}

.navbar-nav .nav-link:hover::after {
  width: 100%;
}

/* Khi ACTIVE (đang ở route hiện tại) */
.navbar-nav .nav-link.router-link-active {
  color: #ffc107; /* chữ đổi màu */
}

/* Khi ACTIVE: gạch chân hiển thị sẵn */
.navbar-nav .nav-link.router-link-active::after {
  width: 100%;
  background-color: #ffc107;
}
.navbar-nav {
  display: flex;
  justify-content: center; /* Căn giữa theo chiều ngang */
  align-items: center;     /* Căn giữa theo chiều dọc (nếu cần) */
  width: 100%;
}

.nav-item {
  margin: 0 15px; /* Khoảng cách đều hai bên giữa các mục */
}


</style>
