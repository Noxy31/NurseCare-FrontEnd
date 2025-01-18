<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  errorTitle?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: '404 Page Not Found',
  errorMessage: 'The page you are looking for does not exist.'
})

const router = useRouter()
const redirectPath = ref('/home')

const fetchUserRole = async () => {
  try {
    const response = await fetch('/api/users/me', {
      credentials: 'include',
    })

    if (!response.ok) {
      console.log('Response not ok:', response.status)
      throw new Error('Failed to fetch user data')
    }

    const data = await response.json()
    console.log('Data received:', data)

    switch (data.role) {
      case 'manager':
        redirectPath.value = '/MHome'
        break
      case 'secretary':
        redirectPath.value = '/SHome'
        break
      case 'nurse':
        redirectPath.value = '/NHome'
        break
      default:
        console.log('Role non reconnu:', data.role)
        redirectPath.value = '/access-denied'
    }
  } catch (error) {
    console.error('Error fetching user role:', error)
    redirectPath.value = '/'
  }
}

const handleRedirect = () => {
  router.push(redirectPath.value)
}

onMounted(() => {
  fetchUserRole()
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
      <button
        @click="handleRedirect"
        class="inline-block bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        Go to Home
      </button>
    </div>
  </div>
</template>
