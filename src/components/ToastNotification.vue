<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

const props = withDefaults(defineProps<ToastProps>(), {
  message: '',
  type: 'success',
  duration: 3000,
  onClose: () => {}
});

const shouldRender = ref(true);
const isVisible = ref(false);
let timer: number;
let hideTimer: number;

onMounted(() => {
  requestAnimationFrame(() => {
    isVisible.value = true;
  });
  timer = setTimeout(() => {
    isVisible.value = false;
    hideTimer = setTimeout(() => {
      shouldRender.value = false;
      props.onClose();
    }, 1000);
  }, props.duration);
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  clearTimeout(hideTimer);
});
</script>

<template>
  <div
    v-if="shouldRender"
    :class="[
      'fixed top-4 right-4 z-50',
      type === 'success' ? 'bg-emerald-600/40' : 'bg-red-900/50',
      'backdrop-blur-md p-4 rounded-xl',
      'shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]',
      'border',
      type === 'success' ? 'border-emerald-700/20' : 'border-red-700/20',
      'flex items-center gap-3 min-w-[280px]',
      'transition-all duration-1000 ease-in-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    ]"
  >
    <div v-if="type === 'success'" class="w-5 h-5 text-emerald-900">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
    <div v-else class="w-5 h-5 text-red-900">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <p :class="[
      'font-medium',
      type === 'success' ? 'text-emerald-900' : 'text-red-900'
    ]">
      {{ message }}
    </p>
  </div>
</template>
