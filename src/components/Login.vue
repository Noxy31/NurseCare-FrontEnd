<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DynamicForm from './DynamicForm.vue'
import type { FormField } from './DynamicForm.vue'
import '@/assets/logo/NurseCare-Logo.png'

const loading = ref(false)
const router = useRouter()

const loginFields: FormField[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    default: '',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    default: '',
  },
]

const handleLogin = async (formData: Record<string, string>) => {
  if (loading.value) return
  loading.value = true

  const normalFormData = { ...formData }

  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalFormData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Server response:', errorData)
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await response.json()
    console.log('Login successful:', data.message)
    router.push('/home')
  } catch (error) {
    console.error('Error during login:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex flex-col min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50 p-4">
    <!-- Header with logo and title -->
    <div class="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
      <img
        src="@/assets/logo/NurseCare-Logo.png"
        alt="Nurse Care Logo"
        class="h-24 w-auto drop-shadow-md"
      />
      <h1 class="text-6xl md:text-8xl font-Octarine whitespace-nowrap bg-gradient-to-r from-sky-400 via-sky-500 to-blue-400 text-transparent bg-clip-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] px-1">
        Nurse Care
      </h1>
    </div>

    <div class="flex items-center justify-center w-full h-full pt-48">
      <div class="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 w-full max-w-sm border border-white/40">
        <h2 class="text-xl md:text-2xl font-medium font-poppins text-sky-900 text-center mb-8">Login</h2>

        <DynamicForm
          :fields="loginFields"
          submitLabel="Login"
          :isLoading="loading"
          @submit="handleLogin"
        />

        <div
          v-if="loading"
          class="text-sky-600 text-center mt-4 flex items-center justify-center gap-2"
        >
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      </div>
    </div>
  </div>
</template>
