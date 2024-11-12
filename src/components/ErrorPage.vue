<script setup lang="ts">
interface Props {
  errorTitle?: string
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  errorTitle: '404 Page Not Found',
  errorMessage: 'The page you are looking for does not exist.'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50 p-4">
    <div class="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40 max-w-md md:max-w-lg w-full text-center mx-2">
      <img
        src="@/assets/logo/NurseCare-Logo.png"
        alt="Nurse Care Logo"
        class="h-16 w-auto drop-shadow-md mx-auto mb-6"
      />
      <h1 class="text-2xl md:text-4xl font-bold text-sky-900 mb-4">{{ errorTitle }}</h1>
      <p class="text-base md:text-lg text-sky-800 mb-8">{{ errorMessage }}</p>
      <router-link
        to="/home"
        class="inline-block bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        Go to Home
      </router-link>
    </div>
  </div>
</template>
