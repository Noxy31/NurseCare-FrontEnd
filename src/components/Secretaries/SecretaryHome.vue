<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Cookies from 'js-cookie'
import { Calendar, Receipt, Users, UserCog, LogOut } from 'lucide-vue-next'

const userName = ref<string | null>(null)

const fetchUserName = async () => {
  try {
    const response = await fetch('/api/users/me', {
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    const data = await response.json()
    userName.value = data.name
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
}

const logout = () => {
  Cookies.remove('token')
  window.location.href = '/'
}

onMounted(() => {
  fetchUserName()
})
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <!-- Navigation latérale -->
    <nav class="w-64 bg-white/30 backdrop-blur-md border-r border-white/40 p-6 flex flex-col">
      <div class="flex items-center gap-4 mb-8">
        <img
          src="@/assets/logo/NurseCare-Logo.png"
          alt="Nurse Care Logo"
          class="h-12 w-auto drop-shadow-md"
        />
        <h1 class="text-xl font-Octarine bg-gradient-to-r from-sky-400 via-sky-500 to-blue-400 text-transparent bg-clip-text">
          Nurse Care
        </h1>
      </div>

      <div class="flex flex-col space-y-2">
        <router-link
          to="/Splanning"
          class="p-3 text-sky-900 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <Calendar class="h-5 w-5" />
          Planning
        </router-link>

        <router-link
          to="/bills"
          class="p-3 text-sky-900 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <Receipt class="h-5 w-5" />
          Bills
        </router-link>

        <router-link
          to="/patients"
          class="p-3 text-sky-900 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <Users class="h-5 w-5" />
          Patients
        </router-link>

        <div class="my-4 border-t-2 border-sky-300"></div>

        <router-link
          to="/users"
          class="p-3 text-sky-900 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-3"
        >
          <UserCog class="h-5 w-5" />
          Users
        </router-link>
      </div>

      <div class="mt-auto pt-6">
        <button
          @click="logout"
          class="w-full p-3 text-sky-900 hover:bg-sky-100 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogOut class="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="flex-1 p-8">
      <div class="flex items-center mb-8">
        <p class="text-xl text-sky-900 font-poppins">
          Welcome back
          <span class="font-medium">{{ userName || 'Loading...' }},</span>
          have a nice day !
        </p>
      </div>

      <div class="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40">
        <!-- Espace réservé pour le contenu futur -->
      </div>
    </main>
  </div>
</template>
