<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Menu, X, UserCircle, Users, Calendar as CalendarIcon, LogOut, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Cookies from 'js-cookie'

interface Appointment {
  idApp: number
  appDate: string
  plannedAppTime: string
  realAppTime: string | null
  isDone: boolean
  idClient: number
  clientFirstName: string
  clientLastName: string
  clientAddress: string
}

const userName = ref<string | null>(null)
const isMenuOpen = ref(false)
const appointments = ref<Appointment[]>([])
const currentAppointmentIndex = ref(0)

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

const fetchTodayAppointments = async () => {
  try {
    const response = await fetch('/api/appointments/nurse/today', {
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch appointments')
    }
    appointments.value = await response.json()
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

const nextAppointment = () => {
  if (currentAppointmentIndex.value < appointments.value.length - 1) {
    currentAppointmentIndex.value++
  }
}

const previousAppointment = () => {
  if (currentAppointmentIndex.value > 0) {
    currentAppointmentIndex.value--
  }
}

const formatTime = (time: string) => {
  return time.substring(0, 5) // Assuming time format is "HH:MM:SS"
}

const logout = () => {
  Cookies.remove('token')
  window.location.href = '/'
}

onMounted(() => {
  fetchUserName()
  fetchTodayAppointments()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <!-- Header -->
    <header class="bg-white/30 backdrop-blur-md p-4 flex justify-between items-center">
      <button
        @click="isMenuOpen = !isMenuOpen"
        class="p-2 rounded-lg hover:bg-indigo-100/50 transition-colors"
      >
        <Menu class="h-6 w-6 text-indigo-900" />
      </button>
      <div class="flex items-center gap-2">
        <img src="@/assets/logo/NurseCare-Logo.png" alt="NurseCare" class="h-8 w-auto" />
        <span class="text-lg font-medium text-indigo-900">NurseCare</span>
      </div>
    </header>

    <main class="p-4">
      <!-- Welcome message -->
      <div class="mb-4">
        <p class="text-sm text-indigo-900/70">
          Welcome back
          <span class="font-medium">{{ userName || 'Loading...' }}</span>
        </p>
      </div>

      <!-- Today's Appointments Carousel -->
      <div class="mt-6">
        <h2 class="text-xl font-semibold text-indigo-900 mb-4">Today's Appointments</h2>

        <div v-if="appointments.length > 0" class="relative">
          <!-- Appointment Card -->
          <div class="bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/40">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-indigo-900">
                  {{ formatTime(appointments[currentAppointmentIndex].plannedAppTime) }}
                </span>
                <span class="px-3 py-1 rounded-full text-sm"
                  :class="appointments[currentAppointmentIndex].isDone ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                  {{ appointments[currentAppointmentIndex].isDone ? 'Completed' : 'Pending' }}
                </span>
              </div>

              <div class="space-y-2">
                <h3 class="text-lg font-semibold text-indigo-900">
                  {{ appointments[currentAppointmentIndex].clientFirstName }}
                  {{ appointments[currentAppointmentIndex].clientLastName }}
                </h3>
                <p class="text-indigo-900/70">
                  {{ appointments[currentAppointmentIndex].clientAddress }}
                </p>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="absolute inset-y-0 left-0 -left-4 flex items-center">
            <button
              @click="previousAppointment"
              :disabled="currentAppointmentIndex === 0"
              class="p-2 rounded-full bg-white/50 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="h-6 w-6" />
            </button>
          </div>
          <div class="absolute inset-y-0 right-0 -right-4 flex items-center">
            <button
              @click="nextAppointment"
              :disabled="currentAppointmentIndex === appointments.length - 1"
              class="p-2 rounded-full bg-white/50 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight class="h-6 w-6" />
            </button>
          </div>

          <!-- Pagination Dots -->
          <div class="flex justify-center gap-2 mt-4">
            <div
              v-for="(_, index) in appointments"
              :key="index"
              :class="[
                'h-2 w-2 rounded-full transition-all',
                currentAppointmentIndex === index ? 'bg-indigo-900' : 'bg-indigo-900/30'
              ]"
            />
          </div>
        </div>

        <!-- No Appointments Message -->
        <div v-else class="bg-white/30 backdrop-blur-md p-6 rounded-xl text-center">
          <p class="text-indigo-900">No appointments scheduled for today</p>
        </div>
      </div>
    </main>
  </div>
</template>
