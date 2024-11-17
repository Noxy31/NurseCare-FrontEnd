<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns' // Ajout de l'import manquant
import SideNav from '@/components/Secretaries/SideNavSecretary.vue'
import Calendar from '../Calendar.vue'
import ToastNotification from '../ToastNotification.vue'
import DynamicForm from '../DynamicForm.vue'
import type { FormField } from '../DynamicForm.vue'

interface CalendarEvent {
  id: number | string
  date: Date
  time: string
  title?: string
  [key: string]: any
}

interface AppointmentFormData {
  date: string
  time: string
  patientId: number
  nurseId: number
}

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const showForm = ref(false)
const events = ref<CalendarEvent[]>([])
const selectedDate = ref<Date>(new Date())

const formFields = computed((): FormField[] => [
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    default: selectedDate.value ? format(selectedDate.value, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  },
  {
    name: 'time',
    label: 'Time',
    type: 'time',
    default: ''
  },
  {
    name: 'patientId',
    label: 'Patient',
    type: 'text',
    suggestions: []
  },
  {
    name: 'nurseId',
    label: 'Nurse',
    type: 'text',
    suggestions: []
  }
])

const showNotification = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const fetchEvents = async () => {
  try {
    const response = await fetch('/api/events/get-events')
    if (!response.ok) throw new Error('Failed to fetch events')
    const data = await response.json()
    events.value = data.map((event: any) => ({
      ...event,
      id: event.id || `temp-${Date.now()}-${Math.random()}`,
      date: new Date(event.date),
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    showNotification('Failed to load events', 'error')
  }
}

const handleFormSubmit = async (formData: Record<string, any>) => {
  try {
    const eventData: AppointmentFormData = {
      date: formData.date,
      time: formData.time,
      patientId: formData.patientId,
      nurseId: formData.nurseId,
    }

    const response = await fetch('/api/events/create-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) throw new Error('Failed to create event')

    await fetchEvents()
    showNotification('Appointment created successfully', 'success')
    showForm.value = false
  } catch (error) {
    console.error('Error creating event:', error)
    showNotification('Failed to create appointment', 'error')
  }
}

const handleEventClick = (event: CalendarEvent) => {
  console.log('Event clicked:', event)
}

const handleDateClick = (date: Date) => {
  selectedDate.value = date
  showForm.value = true
}

const handleNewEventClick = () => {
  selectedDate.value = new Date()
  showForm.value = true
}

onMounted(fetchEvents)
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <SideNav />

    <main class="flex-1 p-8 overflow-auto">
      <ToastNotification
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />

      <div class="flex gap-8">
        <div
          class="flex-1 bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40"
        >
          <div class="flex items-center gap-4 mb-8">
            <h1 class="text-3xl md:text-4xl font-medium text-sky-900">Planning Management</h1>
          </div>

          <Calendar
            :events="events"
            @new-event-click="handleNewEventClick"
            @event-click="handleEventClick"
            @date-click="handleDateClick"
          />
        </div>

        <!-- Form Panel -->
        <div
          v-if="showForm"
          class="w-96 bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/40"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-medium text-sky-900">New Appointment</h2>
            <button
              @click="showForm = false"
              class="text-sky-900/60 hover:text-sky-900 transition-colors"
            >
              ✕
            </button>
          </div>

          <DynamicForm
            :fields="formFields"
            submit-label="Create Appointment"
            @submit="handleFormSubmit"
            @validation-error="() => showNotification('Please fill all required fields', 'error')"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(186, 230, 253, 0.4) transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background-color: rgba(186, 230, 253, 0.4);
  border-radius: 20px;
  border: transparent;
}
</style>
