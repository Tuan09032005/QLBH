<template>
  <div class="global-notifications" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id" class="toast-item" :class="t.type">
        <div class="toast-inner d-flex align-items-center p-2">
          <div class="flex-grow-1">
            <div class="toast-message" v-html="t.message"></div>
          </div>
          <button class="btn-close btn-close-white ms-3" @click="remove(t.id)" aria-label="Close"></button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { toasts, remove } from '@/stores/notifications'
import { computed } from 'vue'

const toastsList = toasts
const toastsComputed = computed(() => toastsList.value)

function removeToast(id) {
  remove(id)
}

const toastsRef = toastsComputed
</script>

<style scoped>
.global-notifications {
  position: fixed;
  top: 88px;
  right: 18px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast-item {
  min-width: 260px;
  max-width: 380px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.toast-inner { background: #111827; color: #fff; display:flex; align-items:center; }
.toast-item.success .toast-inner { background: #16a34a }
.toast-item.error .toast-inner { background: #dc2626 }
.toast-item.warn .toast-inner { background: #f59e0b }
.toast-item.info .toast-inner { background: #0ea5e9 }
.toast-message { font-size: 0.95rem; padding: 6px 8px }

.toast-enter-active, .toast-leave-active { transition: all 240ms ease; }
.toast-enter-from { opacity: 0; transform: translateY(-8px) scale(0.98); }
.toast-leave-to { opacity: 0; transform: translateY(-8px) scale(0.98); }
</style>