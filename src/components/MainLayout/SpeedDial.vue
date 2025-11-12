<template>
  <div class="speed-dial">
    <!-- Nút chính -->
    <button
      class="main-btn btn btn-danger rounded-circle"
      @click="toggle"
      aria-label="Toggle Speed Dial"
    >
      <i class="bi" :class="show ? 'bi-x' : 'bi-plus'"></i>
    </button>

    <!-- Các action phụ -->
    <transition-group name="fade" tag="div" class="actions">
      <a
        v-for="(action, index) in actions"
        :key="action.icon"
        v-show="show"
        :href="action.link"
        target="_blank"
        class="btn btn-light rounded-circle action-btn"
        :style="{ bottom: `${(index + 1) * spacing}px` }"
        :aria-label="action.icon"
      >
        <i :class="action.icon" class="fs-5"></i>
      </a>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const toggle = () => {
  show.value = !show.value
}

// Khoảng cách giữa các action
const spacing = 60

const actions = [
  { icon: 'bi bi-facebook text-primary', link: 'https://facebook.com' },
  { icon: 'bi bi-messenger text-primary', link: 'https://messenger.com' },
  { icon: 'bi bi-twitter-x', link: 'https://x.com' },
  { icon: 'bi bi-chat-dots text-success', link: 'https://zalo.me' },
]
</script>

<style scoped>
.speed-dial {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}

.main-btn {
  width: 56px;
  height: 56px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.actions {
  position: absolute;
  right: 0;
  bottom: 0;
}

.action-btn {
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

/* Hiệu ứng chuyển động */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
}
</style>
