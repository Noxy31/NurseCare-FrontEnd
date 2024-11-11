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
  <div class="flex items-center justify-center min-h-screen bg-gray-900 p-4">
    <div class="bg-gray-800 text-white rounded-lg shadow-lg p-6 md:p-10 max-w-md md:max-w-lg w-full text-center mx-2">
      <h1 class="text-2xl md:text-4xl font-bold mb-4">{{ errorTitle }}</h1>
      <p class="text-base md:text-lg mb-6">{{ errorMessage }}</p>
      <router-link
        to="/home"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 md:px-6 rounded-full transition duration-200"
      >
        Go to Home
      </router-link>
    </div>
  </div>
</template>
