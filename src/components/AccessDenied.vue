<script setup lang="ts">
defineOptions({
  name: 'AccessDenied'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900 p-4">
    <div class="bg-gray-800 text-white rounded-lg shadow-lg p-6 md:p-10 max-w-md w-full mx-4 text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Access Denied</h1>
      <p class="text-base md:text-lg mb-4 md:mb-6">You do not have permission to access this page.</p>
      <router-link
        to="/"
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 md:px-6 rounded-full transition duration-200"
      >
        Go to Login
      </router-link>
    </div>
  </div>
</template>
