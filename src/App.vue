<template>
  <div class="app-container" style="background-color: #F5F5F5;">
    <template v-if="!isAdminPage">
      <Navbar />
      <GlobalNotifications />
      <SpeedDial />
      <div style="padding-top: 150px;">
        
        <FooterLayout />
      </div>
    </template>

    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/MainLayout/Navbar.vue";
import FooterLayout from "./components/MainLayout/FooterLayout.vue";
import SpeedDial from "./components/MainLayout/SpeedDial.vue";
import GlobalNotifications from './components/GlobalNotifications.vue'

const route = useRoute();

const isAdminPage = computed(() => route.path.startsWith("/admin"));
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
