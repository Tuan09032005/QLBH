import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/product',
      name: 'product',
 
      component: () => import('../views/ProductView.vue'),
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: () => import('../views/ProductDetail.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Register.vue"),
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: () => import("../views/ForgotPassword.vue"),
    },
    {
      path: "/update-password",
      name: "UpdatePassword",
      component: () => import("../views/UpdateView.vue"),
    },

    {
      path: "/admin/employee",
      name: "adminemployee",
      component: () => import("../views/AdminEmployee.vue"),
    },
    {
      path: "/admin/product",
      name: "adminproduct",
      component: () => import("../views/AdminProduct.vue"),
    },

  ],
})

export default router
