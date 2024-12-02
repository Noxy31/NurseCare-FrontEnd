<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
  <div class="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <main class="p-4">
      <!-- En-tête avec message de bienvenue -->
      <div class="flex items-center mb-6">
        <p class="text-lg text-indigo-900 font-poppins">
          Bonjour
          <span class="font-medium">{{ userName || 'Loading...' }},</span>
          bonne journée !
        </p>
      </div>

      <!-- Carte principale avec effet glassmorphism -->
      <div
        class="bg-white/30 backdrop-blur-md p-6 rounded-2xl
               shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
               hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]
               transition-shadow duration-300
               border border-white/40
               space-y-4"
      >
        <!-- Espace pour le contenu futur -->
      </div>

      <!-- Zone de boutons d'action rapide -->
      <div class="mt-6 grid grid-cols-2 gap-4">
        <button
          class="p-4 bg-white/50 rounded-xl backdrop-blur-sm
                 shadow-sm hover:shadow-md transition-shadow
                 text-indigo-900 font-medium
                 flex items-center justify-center"
        >
          Action 1
        </button>
        <button
          class="p-4 bg-white/50 rounded-xl backdrop-blur-sm
                 shadow-sm hover:shadow-md transition-shadow
                 text-indigo-900 font-medium
                 flex items-center justify-center"
        >
          Action 2
        </button>
      </div>
    </main>
  </div>
</template>
