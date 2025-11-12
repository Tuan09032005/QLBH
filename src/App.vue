<template>
  <div class="app-container" style="background-color: #F5F5F5;">
  <navbar></navbar>
  <SpeedDial />


<div style="padding-top: 150px;"><FooterLayout ></FooterLayout></div>

  </div>
</template>

<script setup>
import { useCartStore } from './stores/cart.js'
import Navbar from './components/MainLayout/Navbar.vue'
import FooterLayout from './components/MainLayout/FooterLayout.vue';
import SpeedDial from './components/MainLayout/SpeedDial.vue';



</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  width: 100%;
  padding-top: 112px; /* Tổng chiều cao của 2 navbar fixed-top */
  box-sizing: border-box;
}
</style>
