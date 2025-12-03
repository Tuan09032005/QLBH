<template>
  <div class="speed-dial" :class="positionClass">
    <!-- Nút chính -->
    <button
      class="main-btn rounded-circle"
      @click="toggle"
      :aria-expanded="show.toString()"
      aria-label="Toggle Speed Dial"
      title="Mở nhanh"
    >
      <span class="btn-bg">
        <i class="bi" :class="show ? 'bi-x' : 'bi-plus'" aria-hidden="true"></i>
      </span>
    </button>

    <!-- Pin button to persist visibility -->
    <button
      class="pin-btn"
      @click.stop="togglePin"
      :title="isPinned ? 'Gỡ ghim' : 'Ghim để duy trì hiển thị'"
      :aria-pressed="isPinned.toString()"
    >
      <i class="bi" :class="isPinned ? 'bi-pin-fill' : 'bi-pin'"></i>
    </button>

    <!-- Các action phụ -->
    <transition-group name="stagger" tag="div" class="actions">
      <a
        v-for="(action, index) in actions"
        :key="action.key"
        v-if="show"
        :href="action.link"
        target="_blank"
        class="action-btn"
        :class="action.variant"
        :style="{ bottom: `${(index + 1) * spacing}px`, transitionDelay: `${index * 40}ms` }"
        :aria-label="action.label"
        :title="action.label"
      >
        <i :class="action.icon" aria-hidden="true"></i>
        <span class="action-label">{{ action.label }}</span>
      </a>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const show = ref(false)
const isPinned = ref(false)

const toggle = () => {
  show.value = !show.value
}

const togglePin = () => {
  isPinned.value = !isPinned.value
  if (isPinned.value) show.value = true
}

// Khoảng cách giữa các action (px)
const spacing = 70

const actions = [
  { key: 'facebook', icon: 'bi bi-facebook', label: 'Facebook', link: 'https://facebook.com', variant: 'brand-fb' },
  { key: 'messenger', icon: 'bi bi-messenger', label: 'Messenger', link: 'https://messenger.com', variant: 'brand-ms' },
  { key: 'x', icon: 'bi bi-twitter-x', label: 'X/Twitter', link: 'https://x.com', variant: 'brand-x' },
  { key: 'zalo', icon: 'bi bi-chat-dots', label: 'Zalo', link: 'https://zalo.me', variant: 'brand-zalo' },
]

// allow simple positioning class if needed later
const positionClass = 'pos-bottom-right'

onMounted(() => {
  try {
    const pinned = localStorage.getItem('speedDialPinned') === '1'
    const open = localStorage.getItem('speedDialOpen') === '1'
    isPinned.value = pinned
    show.value = pinned || open
  } catch (e) {
    // ignore storage errors
  }
})

watch(show, (v) => {
  try { localStorage.setItem('speedDialOpen', v ? '1' : '0') } catch (e) {}
})
watch(isPinned, (v) => {
  try { localStorage.setItem('speedDialPinned', v ? '1' : '0') } catch (e) {}
})
</script>

<style scoped>
.speed-dial {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}
.pos-bottom-right { right: 20px; bottom: 20px }

/* Main button */
.main-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  background: linear-gradient(135deg,#ff6a88 0%,#ff9472 100%);
  color: #fff;
}
.main-btn:active { transform: scale(0.98) }
.main-btn .btn-bg { display: inline-flex; align-items:center; justify-content:center; font-size:20px }

.actions { position: absolute; right: 0; bottom: 0 }

.action-btn {
  position: absolute;
  right: 8px;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 8px 10px;
  color: #fff;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(2,6,23,0.25);
  transform-origin: center bottom;
  transition: transform 0.28s cubic-bezier(.2,.9,.2,1), opacity 0.2s ease, bottom 0.2s ease;
  opacity: 1;
}
.action-btn i { font-size: 18px }
.action-btn .action-label { display:none; white-space:nowrap; font-size:13px; font-weight:600 }

/* Variants */
.brand-fb { background: linear-gradient(135deg,#1877F2 0%,#145DBF 100%) }
.brand-ms { background: linear-gradient(135deg,#00B2FF 0%,#0078D4 100%) }
.brand-x  { background: linear-gradient(135deg,#1DA1F2 0%,#0f8fe4 100%) }
.brand-zalo{ background: linear-gradient(135deg,#1ea1ff 0%,#0078d4 100%) }

/* Show action when visible */
.stagger-enter-active { transition: all 320ms cubic-bezier(.2,.9,.2,1) }
.stagger-leave-active { transition: all 180ms ease }
.stagger-enter-from { opacity: 0; transform: scale(.6) translateY(10px) }
.stagger-enter-to { opacity: 1; transform: scale(1) translateY(0) }
.stagger-leave-to { opacity: 0; transform: scale(.6) translateY(10px) }

/* When v-show makes item visible it still uses enter transitions; use the following to display label on hover */
.action-btn:hover { transform: translateY(-4px) scale(1.02) }
.action-btn:hover .action-label { display:inline-block; margin-left:6px; opacity:1 }

/* Small screens: compact circle only */
@media (max-width: 480px) {
  .action-btn .action-label { display:none }
  .main-btn { width:56px; height:56px }
}

/* Pin button styles */
.pin-btn {
  position: absolute;
  right: 74px;
  bottom: 12px;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.06);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(2,6,23,0.18);
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease;
}
.pin-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px) }
.pin-btn i { font-size: 14px }

@media (max-width: 480px) {
  .pin-btn { display: none }
}
</style>
