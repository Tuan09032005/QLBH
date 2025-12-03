<template>
  <!-- Unified sticky navbar -->
  <nav ref="navbarMain" class="navbar-main" aria-label="Main navigation">
    <div class="top-row container-fluid d-flex align-items-center px-3">
      <div class="d-flex align-items-center" style="min-width: 180px;">
        <img src="@/assets/SPORTSY__1_-removebg-preview.png" alt="SPORTY7" class="brand-logo" />
      </div>

      <div class="flex-grow-1 px-3">
        <form class="d-flex mx-auto" style="max-width:760px;" @submit.prevent="onNavSearch">
          <input v-model="navSearch" class="form-control me-2" type="search" placeholder="Tìm kiếm sản phẩm, ví dụ: giày chạy" aria-label="Search" />
          <button class="btn btn-outline-dark" type="submit">Tìm</button>
        </form>
      </div>

      <div class="d-flex align-items-center top-right" style="min-width:220px; justify-content:flex-end; gap:12px;">
        <!-- User / Account -->
        <div class="icon-wrapper" @mouseenter="openUserPopup" @mouseleave="closeUserPopup">
          <div class="user-button d-flex align-items-center">
            <i class="bi bi-person nav-icon" style="font-size:22px"></i>
            <span v-if="isLoggedIn" class="ms-2 user-name">{{ displayName }}</span>
          </div>

          <div v-show="showUserPopup" class="popup user-popup shadow-sm">
            <template v-if="isLoggedIn">
              <div class="popup-item">Xin chào, <strong>{{ displayName }}</strong></div>
              <div class="popup-actions">
                <button class="btn btn-sm btn-outline-secondary w-100 mb-1" @click="() => { showUserPopup = false; router.push('/account') }">Tài khoản</button>
                <button class="btn btn-sm btn-danger w-100" @click="logout">Đăng xuất</button>
              </div>
            </template>
            <template v-else>
              <div class="popup-item">Bạn chưa đăng nhập</div>
              <div class="popup-actions">
                <button class="btn btn-sm btn-primary w-100 mb-1" @click="() => { showUserPopup = false; router.push('/login') }">Đăng nhập</button>
                <button class="btn btn-sm btn-outline-primary w-100" @click="() => { showUserPopup = false; router.push('/register') }">Đăng ký</button>
              </div>
            </template>
          </div>
        </div>

        <!-- Cart (simple link) -->
        <router-link to="/cart" class="position-relative d-flex align-items-center" style="text-decoration:none">
          <i class="bi bi-cart3 nav-icon" style="font-size:22px"></i>
          <span v-if="cartCount > 0" class="badge cart-badge">{{ cartCount }}</span>
        </router-link>
      </div>
    </div>

    <div class="bottom-row">
      <div class="container-fluid">
        <div class="navbar-collapse" id="navbarMainLinks">
          <ul class="navbar-nav nav-links" role="menubar" aria-label="Primary">
            <li class="nav-item" role="none"><router-link to="/" class="nav-link" role="menuitem">Trang chủ</router-link></li>
            <li class="nav-item" role="none"><router-link to="/product" class="nav-link" role="menuitem">Sản phẩm</router-link></li>
            <li class="nav-item" role="none"><router-link to="/contact" class="nav-link" role="menuitem">Liên hệ</router-link></li>
            <li class="nav-item" role="none"><router-link to="/about" class="nav-link" role="menuitem">Giới thiệu</router-link></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

  <!-- Nội dung trang chính -->
  <div class="content-offset">
    <router-view />
  </div>
</template>

<script setup>
import { useCartStore } from "@/stores/cart";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";


const router = useRouter();
const isLoggedIn = ref(false);
const displayName = ref("User");
const isAdmin = ref(false);
const userEmail = ref('')
const navSearch = ref('')

// Refs for sticky animation
const navbarMain = ref(null)
let scrollListener = null


// Giỏ hàng
const cart = useCartStore();
const cartCount = computed(() =>
  cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

// Mở/đóng menu người dùng
// clicking user icon navigates to /account or /login (handled in template)

import { ref as vueRef } from 'vue'

const onNavSearch = () => {
  const q = (navSearch.value || '').trim()
  if (!q) router.push('/product')
  else router.push({ path: '/product', query: { q } })
}

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
    userEmail.value = userData.email || ''
  }

  // initialize and set a CSS variable for page offset based on current navbar height
  if (navbarMain.value) {
    const h = Math.round(navbarMain.value.getBoundingClientRect().height)
    document.documentElement.style.setProperty('--navbar-height', `${h}px`)
  }

  // Toggle compact class on scroll and keep --navbar-height updated
  scrollListener = () => {
    if (!navbarMain.value) return
    const scrolled = window.scrollY > 20
    navbarMain.value.classList.toggle('compact', scrolled)
    const h = Math.round(navbarMain.value.getBoundingClientRect().height)
    document.documentElement.style.setProperty('--navbar-height', `${h}px`)
  }
  window.addEventListener('scroll', scrollListener, { passive: true })
});

onBeforeUnmount(() => {
  if (scrollListener) window.removeEventListener('scroll', scrollListener)
})

// User popup state
const showUserPopup = vueRef(false)
let userPopupTimer = null

const openUserPopup = () => {
  if (userPopupTimer) clearTimeout(userPopupTimer)
  showUserPopup.value = true
}
const closeUserPopup = () => {
  if (userPopupTimer) clearTimeout(userPopupTimer)
  userPopupTimer = setTimeout(() => { showUserPopup.value = false }, 220)
}

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

.user-menu { min-width: 220px }
.cart-badge { position: absolute; top: -6px; right: -10px; background: #dc3545; color: #fff; border-radius: 999px; padding: 4px 7px; font-size: 0.75rem; font-weight:600 }

/* Top + Bottom unified navbar styles */
.navbar-main { position: fixed; top: 0; left: 0; right: 0; z-index: 1030; width: 100%; transition: box-shadow 220ms ease; }
.navbar-main .top-row { display: flex; align-items: center; height: 96px; background: #fff; box-shadow: 0 6px 18px rgba(0,0,0,0.06); transition: height 220ms cubic-bezier(.2,.8,.2,1), box-shadow 220ms ease, padding 220ms ease; }
.navbar-main .brand-logo { height: 80px; object-fit: contain; transition: height 220ms ease; }
.navbar-main.compact .top-row { height: 76px }
.navbar-main.compact .brand-logo { height: 64px }
.navbar-main .nav-icon { color: #333; transition: color 220ms ease, transform 220ms ease; }
.navbar-main .form-control { background: #f8f9fa; color: #333 }
.navbar-main .btn { background: #343a40; border-color: #343a40 }
.top-right { color: #333 }

/* bottom row (links) */
.navbar-main .bottom-row { background: linear-gradient(90deg,#b21f2d 0%, #dc3545 100%); height: 56px; display: flex; align-items: center; transition: height 220ms ease, background 220ms ease; }
.navbar-main .bottom-row .navbar-nav { display:flex; justify-content:center; width:100% }

/* Icon wrapper and popups */
.icon-wrapper { position: relative; }
.user-button, .cart-button { padding: 6px 8px; border-radius: 8px; transition: background 160ms ease, transform 120ms ease; }
.user-button:hover, .cart-button:hover { background: rgba(0,0,0,0.04); transform: translateY(-2px); }
.user-name { font-weight: 600; color: #111; }
.popup { position: absolute; right: 0; top: 44px; min-width: 220px; background: #fff; border-radius: 8px; padding: 10px; box-shadow: 0 8px 30px rgba(17,24,39,0.12); z-index: 1100; }
.popup .popup-item { padding: 8px 6px; color: #333; }
.popup .popup-actions { display: flex; flex-direction: column; gap: 6px; padding-top: 6px; }
.user-popup { right: 0; }

/* Professional nav link layout */
.nav-links { list-style: none; margin: 0; padding: 0; display: flex; gap: 28px; align-items: center; justify-content: center; }
.nav-links .nav-item { margin: 0 }
.nav-links .nav-link { color: rgba(255,255,255,0.95); padding: 10px 6px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; font-size: 0.95rem; position: relative; transition: color 180ms ease, transform 180ms ease; }
.nav-links .nav-link::after { content: ""; position: absolute; left: 0; bottom: -8px; height: 3px; width: 0; background: rgba(255,255,255,0.95); transition: width 220ms cubic-bezier(.2,.8,.2,1); border-radius: 2px; }
.nav-links .nav-link:hover { color: #fff; transform: translateY(-1px); }
.nav-links .nav-link:hover::after, .nav-links .nav-link.router-link-active::after { width: 100%; }
.nav-links .nav-link.router-link-active { color: #fff }

/* Force horizontal layout even when Bootstrap applies column on small screens */
.navbar-main .nav-links { flex-direction: row !important; }
.navbar-main .nav-links .nav-item { display: inline-flex; }
.navbar-main .nav-links .nav-link { display: inline-block; }

/* Ensure bottom-row is clickable and links show pointer */
.navbar-main .bottom-row { pointer-events: auto }
.navbar-main .bottom-row .nav-link { cursor: pointer }

/* page content offset using variable set by JS */
.content-offset { padding-top: calc(var(--navbar-height, 128px)); }

/* keep badge and other small styles */
.user-menu { min-width: 220px }
.cart-badge { position: absolute; top: -6px; right: -10px; background: #dc3545; color: #fff; border-radius: 999px; padding: 4px 7px; font-size: 0.75rem; font-weight:600 }

</style>

