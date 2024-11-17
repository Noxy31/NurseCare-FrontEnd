<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SideNav from '@/components/Secretaries/SideNavSecretary.vue'

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

onMounted(() => {
  fetchUserName()
})
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <!-- Barre de navigation -->
    <SideNav />

    <!-- Contenu principal de la home Page -->
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
