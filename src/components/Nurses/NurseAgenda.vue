<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Menu, X, UserCircle, Users, Calendar as CalendarIcon, LogOut } from 'lucide-vue-next'
import Calendar from '../Calendar.vue'
import Cookies from 'js-cookie'

interface Appointment {
  id: number
  date: Date
  time: string
  title: string
  patientName: string
  location: string
}

interface CalendarEvent {
  id: number | string
  date: Date
  time: string
  title?: string
  [key: string]: any
}

const userName = ref<string | null>(null)
const isMenuOpen = ref(false)
const appointments = ref<CalendarEvent[]>([]) // Changé pour correspondre au type attendu par Calendar

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

const fetchAppointments = async () => {
  try {
    const response = await fetch('/api/appointments/nurse', {
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch appointments')
    }
    const data = await response.json()
    appointments.value = data.map((apt: Appointment) => ({
      ...apt,
      date: new Date(apt.date)
    }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

const handleNewAppointment = () => {
  console.log('New appointment clicked')
}

const handleEventClick = (event: CalendarEvent) => { // Changé pour correspondre au type émis par Calendar
  console.log('Event clicked:', event)
}

const logout = () => {
  Cookies.remove('token')
  window.location.href = '/'
}

onMounted(() => {
  fetchUserName()
  fetchAppointments()
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
      <!-- Message de bienvenue -->
      <div class="mb-6">
        <p class="text-lg text-indigo-900">
          Bonjour
          <span class="font-medium">{{ userName || 'Loading...' }},</span>
          bonne journée !
        </p>
      </div>

      <!-- Calendrier avec style responsive -->
      <div class="rounded-xl overflow-hidden shadow-lg">
        <Calendar
          :events="appointments"
          :locale="'fr'"
          :modal-title="'Rendez-vous'"
          :readOnly="true"
          @event-click="handleEventClick"
        >
          <template #event-card="{ event }">
            <div class="bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-900">
                <div class="font-medium">{{ event.time }}</div>
                <div>{{ event.patientName }}</div>
                <div class="text-sm text-indigo-600">{{ event.location }}</div>
              </div>
            </div>
          </template>
        </Calendar>
      </div>
    </main>
  </div>
</template>
