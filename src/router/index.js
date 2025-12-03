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
      path: '/account',
      name: 'account',
      component: () => import('../views/UserProfile.vue')
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('../views/OrderDetail.vue')
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
        path: '/admin',
        component: () => import('../views/AdminLayout.vue'),
        meta: { requiresAdmin: true },
        children: [
          {
            path: '',
            name: 'admin-dashboard',
            component: () => import('../views/AdminDashboard.vue')
          },
          {
            path: 'employee',
            name: 'admin-employee',
            component: () => import('../views/AdminEmployee.vue')
          },
          {
            path: 'product',
            name: 'admin-product',
            component: () => import('../views/AdminProduct.vue')
          }
          ,
          {
            path: 'orders',
            name: 'admin-orders',
            component: () => import('../views/AdminOrders.vue')
          },
        ]
      }

  ],
})

export default router
