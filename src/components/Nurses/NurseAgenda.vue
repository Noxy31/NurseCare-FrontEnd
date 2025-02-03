<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Calendar from '../Calendar.vue'
import NavBar from '@/components/NavBar.vue'

interface AppointmentData {
  idApp: number
  appDate: string
  foresAppTime: string
  realAppTime: string | null
  isDone: boolean
  idClient: number
  clientName: string
  clientAddress: string
  clientPhone: string
  clientMail: string
}

interface CalendarEvent {
  id: number | string
  date: Date
  time: string
  title?: string
  [key: string]: any
}

const router = useRouter()
const userName = ref<string | null>(null)
const appointments = ref<CalendarEvent[]>([])

const nurseNavItems = [
  { name: 'Home', path: '/NHome', icon: 'Home' },
  { name: 'Agenda', path: '/NAgenda', icon: 'Calendar' },
  { name: 'Bills', path: '/NBills', icon: 'FileText' },
  // { name: 'Profile', path: '/NProfile', icon: 'UserCircle' },
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
    if (error instanceof Response && error.status === 401) {
      router.push('/login')
    }
  }
}

const fetchAppointments = async () => {
  try {
    const response = await fetch('/api/appointment/nurse-appointments', {
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      throw new Error('Failed to fetch appointments')
    }

    const data: AppointmentData[] = await response.json()

    appointments.value = data.map(
      (apt: AppointmentData): CalendarEvent => ({
        id: apt.idApp,
        date: new Date(apt.appDate),
        time: apt.foresAppTime,
        title: `${apt.clientName} - ${apt.foresAppTime}`,
        clientName: apt.clientName,
        clientAddress: apt.clientAddress,
        clientPhone: apt.clientPhone,
        clientMail: apt.clientMail,
        foresAppTime: apt.foresAppTime,
        realAppTime: apt.realAppTime,
        isDone: apt.isDone,
      })
    )
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

const handleEventClick = (event: CalendarEvent) => {
  console.log('Event clicked:', event)
}

onMounted(() => {
  fetchUserName()
  fetchAppointments()
})
</script>

<template>
  <div class="flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <NavBar :navItems="nurseNavItems" class="fixed z-50" />

    <main class="flex-1 p-4 sm:ml-64 sm:p-6">
      <div class="mb-8">
        <h1 class="text-2xl text-indigo-900">
          Your Agenda
        </h1>
      </div>

      <div
        class="bg-white/30 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40"
      >
        <Calendar
          :events="appointments"
          :locale="'en'"
          modalTitle="Appointments"
          :readOnly="true"
          class="min-h-[600px] w-full"
          @event-click="handleEventClick"
        >
          <template #event-card="{ event }">
            <div
              class="bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-indigo-200/40"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h3 class="font-medium text-indigo-900">Patient</h3>
                  <p class="text-indigo-600">{{ event.clientName }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-indigo-900">Address</h3>
                  <p class="text-indigo-600">{{ event.clientAddress }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-indigo-900">Planned Time</h3>
                  <p class="text-indigo-600">{{ event.foresAppTime }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-indigo-900">Real Time</h3>
                  <p class="text-indigo-600">{{ event.realAppTime || '-' }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-indigo-900">Phone</h3>
                  <p class="text-indigo-600">{{ event.clientPhone || '-' }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-indigo-900">Email</h3>
                  <p class="text-indigo-600">{{ event.clientMail || '-' }}</p>
                </div>
                <div class="sm:col-span-2">
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-sm font-medium',
                      event.isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800',
                    ]"
                  >
                    {{ event.isDone ? 'Completed' : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </Calendar>
      </div>
    </main>
  </div>
</template>
