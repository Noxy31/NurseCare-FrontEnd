<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import NavBar from '@/components/NavBar.vue'
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
  appDate: Date
  foresAppTime: string
  realAppTime: null
  isDone: number
  idClient: number
  idUser: number
}

const managerNavItems = [
  { name: 'Overview', path: '/MHome', icon: 'Home' },
  { name: 'Agenda', path: '/MAgenda', icon: 'Calendar' },
  { name: 'Users', path: '/MUsers', icon: 'UserCog' },
  { name: 'Trainee', path: '/MTrainee', icon: 'UserPen' },
  { name: 'Bills', path: '/MBills', icon: 'FileText' },
]

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const showForm = ref(false)
const events = ref<CalendarEvent[]>([])
const selectedDate = ref<Date>(new Date())
const isSubmitting = ref(false) // Permet d'éviter les soumissions multiples
const patientSuggestions = ref<{ label: string; value: number }[]>([])
const nurseSuggestions = ref<{ label: string; value: number }[]>([])

const formFields = computed((): FormField[] => [
  {
    name: 'appDate',
    label: 'Date',
    type: 'date',
    default: selectedDate.value
      ? format(selectedDate.value, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
  },
  {
    name: 'foresAppTime',
    label: 'Time',
    type: 'time',
    default: '',
  },
  {
    name: 'idClient',
    label: 'Patient',
    type: 'text',
    suggestions: patientSuggestions.value,
  },
  {
    name: 'idUser',
    label: 'Nurse',
    type: 'text',
    suggestions: nurseSuggestions.value,
  },
])

const showNotification = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const fetchEvents = async () => {
  try {
    const response = await fetch('/api/appointment/get-appointments-details')
    if (!response.ok) throw new Error('Failed to fetch appointments')
    const data = await response.json()
    events.value = data.map((event: any) => ({
      id: event.idApp,
      date: new Date(event.appDate),
      time: event.foresAppTime,
      title: `${event.clientName || 'Unnamed Patient'} - ${event.nurseName || 'Unassigned'}`,
      clientName: event.clientName,
      nurseName: event.nurseName,
      clientMail: event.clientMail,
      clientPhone: event.clientPhone,
      foresAppTime: event.foresAppTime,
      realAppTime: event.realAppTime,
      isDone: event.isDone,
    }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    showNotification('Failed to load appointments', 'error')
  }
}

const fetchSuggestions = async () => {
  try {
    console.log('Fetching patients...')
    const patientResponse = await fetch('/api/client/get-client-names')
    if (!patientResponse.ok) {
      throw new Error('Failed to fetch patients')
    }
    const patients = await patientResponse.json()
    console.log('Raw patients data:', patients)

    patientSuggestions.value = patients.map((patient: any) => ({
      label: patient.clientName,
      value: patient.idClient,
    }))

    console.log('Formatted patient suggestions:', patientSuggestions.value)

    console.log('Fetching nurses...')
    const nurseResponse = await fetch('/api/users/get-nurses')
    if (!nurseResponse.ok) {
      throw new Error('Failed to fetch nurses')
    }
    const nurses = await nurseResponse.json()
    console.log('Raw nurses data:', nurses)

    nurseSuggestions.value = nurses.map((nurse: any) => ({
      label: nurse.userName,
      value: nurse.idUser,
    }))

    console.log('Formatted nurse suggestions:', nurseSuggestions.value)
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    showNotification('Failed to load suggestions', 'error')
  }
}

const handleFormSubmit = async (formData: Record<string, any>) => {
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true

    const eventData: AppointmentFormData = {
      appDate: formData.appDate,
      foresAppTime: formData.foresAppTime,
      realAppTime: null,
      isDone: 0,
      idClient: formData.idClient,
      idUser: formData.idUser,
    }

    const response = await fetch('/api/appointment/create-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) throw new Error('Failed to create appointment')

    await fetchEvents()
    showNotification('Appointment created successfully', 'success')
    showForm.value = false
  } catch (error) {
    console.error('Error creating appointment:', error)
    showNotification('Failed to create appointment', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleEventClick = (event: CalendarEvent) => {
  console.log('Event clicked:', event)
}

const formRef = ref()

const handleDateClick = (date: Date) => {
  selectedDate.value = date
  if (showForm.value) {
    formRef.value?.updateField('date', format(date, 'yyyy-MM-dd'))
  } else {
    showForm.value = true
  }
}

const handleNewEventClick = () => {
  selectedDate.value = new Date()
  showForm.value = true
}

onMounted(() => {
  fetchEvents()
  fetchSuggestions()
})
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <NavBar :navItems="managerNavItems" class="fixed z-50" />

    <main class="flex-1 p-4 sm:ml-64 sm:p-6">
      <ToastNotification
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />

      <div
        class="bg-white/30 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40"
      >
        <div class="flex items-center gap-4 mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-medium text-sky-900">
            Planning Management
          </h1>
        </div>

        <Calendar
          :events="events"
          modalTitle="Appointments"
          class="min-h-[600px] w-full"
          @new-event-click="handleNewEventClick"
          @event-click="handleEventClick"
          @date-click="handleDateClick"
        >
          <template #event-card="{ event }">
            <div
              class="bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-sky-200/40"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h3 class="font-medium text-sky-900">Patient</h3>
                  <p class="text-sky-500">{{ event.clientName }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Nurse</h3>
                  <p class="text-sky-500">{{ event.nurseName }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Planned Time</h3>
                  <p class="text-sky-500">{{ event.foresAppTime }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Real Time</h3>
                  <p class="text-sky-500">{{ event.realAppTime || '-' }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Phone</h3>
                  <p class="text-sky-500">{{ event.clientPhone || '-' }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Email</h3>
                  <p class="text-sky-500">{{ event.clientMail || '-' }}</p>
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

      <Teleport to="body">
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showForm"
            class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            @click="showForm = false"
          />
        </transition>

        <!-- Modal Content -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showForm"
            class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50"
            @click.stop
          >
            <div
              class="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4"
            >
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium text-sky-900">
                  New Appointment
                </h2>
                <button
                  @click="showForm = false"
                  class="text-sky-900/60 hover:text-sky-900 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <DynamicForm
                ref="formRef"
                :fields="formFields"
                submit-label="Create Appointment"
                :disabled="isSubmitting"
                @submit="handleFormSubmit"
                @validation-error="
                  () => showNotification('Please fill all required fields', 'error')
                "
              >
                <template #buttons>
                  <div class="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      @click="showForm = false"
                      :disabled="isSubmitting"
                      class="px-4 py-2 bg-sky-900/10 hover:bg-sky-900/20 text-sky-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="px-4 py-2 bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span v-if="isSubmitting">Creating...</span>
                      <span v-else>Create Appointment</span>
                    </button>
                  </div>
                </template>
              </DynamicForm>
            </div>
          </div>
        </transition>
      </Teleport>
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
