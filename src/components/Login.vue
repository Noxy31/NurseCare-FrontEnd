<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DynamicForm from './DynamicForm.vue'
import ToastNotification from './ToastNotification.vue'
import type { FormField } from './DynamicForm.vue'
import Cookies from 'js-cookie'
import '@/assets/logo/NurseCare-Logo.png'

const loading = ref(false)
const router = useRouter()


const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

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

const showNotification = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

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
      showNotification(errorData.message || 'Login failed', 'error')
      throw new Error(errorData.message || 'Login failed')
    }

    const data = await response.json()
    console.log('Login successful:', data)
    showNotification('Login successful! Redirecting...', 'success')

    const userRole = data.user.role

    let redirectPath
    switch (userRole) {
      case 'manager':
        redirectPath = '/MHome'
        break
      case "secretary":
        redirectPath = '/SPlanning'
        break
      case "nurse":
        redirectPath = '/NHome'
        break
      default:
        redirectPath = '/access-denied'
    }

    console.log('Redirecting to:', redirectPath)

    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)

  } catch (error) {
    console.error('Error during login:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <div class="flex flex-col items-center justify-center min-h-screen gap-16">
      <!-- Logo et titre -->
      <div class="flex items-center">
        <img
          src="@/assets/logo/NurseCare-Logo.png"
          alt="Nurse Care Logo"
          class="h-12 md:h-24 w-auto drop-shadow-md shrink-0"
        />
        <h1 class="text-3xl md:text-8xl font-Octarine bg-gradient-to-r from-sky-400 via-sky-500 to-blue-400 text-transparent bg-clip-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
          NurseCare
        </h1>
      </div>

      <!-- Formulaire -->
      <div class="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 w-full max-w-sm mx-4 border border-white/40">
        <h2 class="text-xl md:text-2xl font-medium font-poppins text-sky-900 text-center mb-8">Welcome</h2>
        <DynamicForm
          :fields="loginFields"
          submitLabel="Login"
          :isLoading="loading"
          @submit="handleLogin"
        />
      </div>
    </div>

    <ToastNotification
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>
