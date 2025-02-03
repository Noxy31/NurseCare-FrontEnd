<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import DashboardCharts from '@/components/DashboardCharts.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref<string | null>(null)
const managerNavItems = [
  { name: 'Overview', path: '/MHome', icon: 'Home' },
  { name: 'Agenda', path: '/MAgenda', icon: 'Calendar' },
  { name: 'Users', path: '/MUsers', icon: 'UserCog' },
  { name: 'Trainee', path: '/MTrainee', icon: 'UserPen' },
]

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
  <div class="relative flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <NavBar :navItems="managerNavItems" />
    <main class="p-4 sm:p-8 sm:pl-72 pt-20 sm:pt-8 w-full">
      <div class="mb-8">
        <p class="text-xl text-indigo-900">
          Welcome back
          <span class="font-medium">{{ userName || 'Loading...' }}, have a nice day !</span>
        </p>
      </div>

      <DashboardCharts />
    </main>
  </div>
</template>
