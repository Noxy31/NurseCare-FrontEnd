<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

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

const secretaryNavItems = [
  { name: 'Home', path: '/SHome', icon: 'Home' },
  { name: 'Planning', path: '/SPlanning', icon: 'Calendar' },
  { name: 'Bills', path: '/SBills', icon: 'Receipt' },
  { name: 'Patients', path: '/patients', icon: 'Users' },
  { name: 'Users', path: '/users', icon: 'UserCog' },
]

onMounted(() => {
  fetchUserName()
})
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <NavBar :navItems="secretaryNavItems" />

    <main class="p-4 sm:p-8 sm:pl-64 pt-20 sm:pt-8">
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
