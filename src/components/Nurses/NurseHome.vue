<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, MapPin, Phone } from 'lucide-vue-next'
import NavBar from '@/components/NavBar.vue'
import Cookies from 'js-cookie'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Appointment {
  idApp: number
  appDate: string
  foresAppTime: string
  realAppTime: string | null
  isDone: boolean
  idClient: number
  clientName: string
  clientAddress: string
  clientPhone: string
}

const userName = ref<string | null>(null)
const isMenuOpen = ref(false)
const appointments = ref<Appointment[]>([])
const currentAppointmentIndex = ref(0)
const tomorrowAppointments = ref<Appointment[]>([])
const currentTomorrowIndex = ref(0)

const nurseNavItems = [
  { name: 'Home', path: '/NHome', icon: 'Home' },
  { name: 'Agenda', path: '/NAgenda', icon: 'Calendar' },
  { name: 'Bills', path: '/NBills', icon: 'FileText' },
  { name: 'Profile', path: '/NProfile', icon: 'UserCircle' },
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

const fetchTodayAppointments = async () => {
  try {
    const response = await fetch('/api/appointment/today-app', {
      credentials: 'include',
    })
    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
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
  return time.substring(0, 5)
}

const fetchTomorrowAppointments = async () => {
  try {
    const response = await fetch('/api/appointment/tomorrow-app', {
      credentials: 'include',
    })
    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      throw new Error('Failed to fetch appointments')
    }
    tomorrowAppointments.value = await response.json()
  } catch (error) {
    console.error('Error fetching tomorrow appointments:', error)
  }
}

const nextTomorrowAppointment = () => {
  if (currentTomorrowIndex.value < tomorrowAppointments.value.length - 1) {
    currentTomorrowIndex.value++
  }
}

const previousTomorrowAppointment = () => {
  if (currentTomorrowIndex.value > 0) {
    currentTomorrowIndex.value--
  }
}

onMounted(() => {
  fetchUserName()
  fetchTodayAppointments()
  fetchTomorrowAppointments()
})
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <NavBar :navItems="nurseNavItems" />
    <main class="p-4 sm:p-8 sm:pl-72 pt-20 sm:pt-8 w-full">
      <!-- Welcome message -->
      <div class="mb-8">
        <p class="text-xl text-indigo-900">
          Welcome back
          <span class="font-medium">{{ userName || 'Loading...' }}</span>
        </p>
      </div>

      <!-- Today's Appointments -->
      <div class="mt-6 pl-4">
        <h2 class="text-2xl font-semibold text-indigo-900 mb-6">Today's Appointments</h2>
        <div v-if="appointments.length > 0" class="relative mx-14 sm:mx-auto max-w-lg sm:max-w-2xl mt-12">
          <div class="bg-white/30 backdrop-blur-md p-4 sm:p-8 rounded-xl shadow-lg border border-white/40">
            <div class="space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-2xl sm:text-3xl font-bold text-indigo-900">
                  {{ formatTime(appointments[currentAppointmentIndex].foresAppTime) }}
                </span>
                <span class="px-3 sm:px-4 py-2 rounded-full text-sm"
                  :class="appointments[currentAppointmentIndex].isDone ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                  {{ appointments[currentAppointmentIndex].isDone ? 'Completed' : 'Pending' }}
                </span>
              </div>
              <div class="space-y-3">
                <h3 class="text-lg sm:text-xl font-semibold text-indigo-900">
                  {{ appointments[currentAppointmentIndex].clientName }}
                </h3>
                <div class="space-y-2 text-indigo-900/70 text-sm sm:text-base">
                  <p class="flex items-center gap-2">
                    <MapPin class="h-5 w-5" />
                    {{ appointments[currentAppointmentIndex].clientAddress }}
                  </p>
                  <p class="flex items-center gap-2">
                    <Phone class="h-5 w-5" />
                    {{ appointments[currentAppointmentIndex].clientPhone }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="previousAppointment"
            :disabled="currentAppointmentIndex === 0"
            class="absolute top-1/2 -translate-y-1/2 -left-12 sm:-left-16 p-3 rounded-full bg-white/70 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shadow-md"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>

          <button
            @click="nextAppointment"
            :disabled="currentAppointmentIndex === appointments.length - 1"
            class="absolute top-1/2 -translate-y-1/2 -right-12 sm:-right-16 p-3 rounded-full bg-white/70 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shadow-md"
          >
            <ChevronRightIcon class="h-6 w-6" />
          </button>

          <div class="text-center mt-4 text-indigo-900/70">
            {{ currentAppointmentIndex + 1 }} / {{ appointments.length }}
          </div>
        </div>
        <div v-else class="bg-white/30 backdrop-blur-md p-6 rounded-xl text-center max-w-2xl mx-auto">
          <p class="text-indigo-900">No appointments scheduled for today</p>
        </div>
      </div>

      <!-- Tomorrow's Appointments -->
      <div class="mt-12 pl-4">
        <h2 class="text-2xl font-semibold text-indigo-900 mb-6">Tomorrow's Appointments</h2>
        <div v-if="tomorrowAppointments.length > 0" class="relative mx-14 sm:mx-auto max-w-lg sm:max-w-2xl mt-12">
          <div class="bg-white/30 backdrop-blur-md p-4 sm:p-8 rounded-xl shadow-lg border border-white/40">
            <div class="space-y-6">
              <div class="flex justify-between items-center">
                <span class="text-2xl sm:text-3xl font-bold text-indigo-900">
                  {{ formatTime(tomorrowAppointments[currentTomorrowIndex].foresAppTime) }}
                </span>
                <span class="px-3 sm:px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800">
                  Scheduled
                </span>
              </div>
              <div class="space-y-3">
                <h3 class="text-lg sm:text-xl font-semibold text-indigo-900">
                  {{ tomorrowAppointments[currentTomorrowIndex].clientName }}
                </h3>
                <div class="space-y-2 text-indigo-900/70 text-sm sm:text-base">
                  <p class="flex items-center gap-2">
                    <MapPin class="h-5 w-5" />
                    {{ tomorrowAppointments[currentTomorrowIndex].clientAddress }}
                  </p>
                  <p class="flex items-center gap-2">
                    <Phone class="h-5 w-5" />
                    {{ tomorrowAppointments[currentTomorrowIndex].clientPhone }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            @click="previousTomorrowAppointment"
            :disabled="currentTomorrowIndex === 0"
            class="absolute top-1/2 -translate-y-1/2 -left-12 sm:-left-16 p-3 rounded-full bg-white/70 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shadow-md"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>

          <button
            @click="nextTomorrowAppointment"
            :disabled="currentTomorrowIndex === tomorrowAppointments.length - 1"
            class="absolute top-1/2 -translate-y-1/2 -right-12 sm:-right-16 p-3 rounded-full bg-white/70 text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shadow-md"
          >
            <ChevronRightIcon class="h-6 w-6" />
          </button>

          <div class="text-center mt-4 text-indigo-900/70">
            {{ currentTomorrowIndex + 1 }} / {{ tomorrowAppointments.length }}
          </div>
        </div>
        <div v-else class="bg-white/30 backdrop-blur-md p-6 rounded-xl text-center max-w-2xl mx-auto">
          <p class="text-indigo-900">No appointments scheduled for tomorrow</p>
        </div>
      </div>
    </main>
  </div>
</template>
