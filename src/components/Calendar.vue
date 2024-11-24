<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  subDays,
  addDays,
} from 'date-fns'

interface CalendarEvent {
  id: number | string
  date: Date
  time: string
  title?: string
  [key: string]: any
}

interface CalendarDay {
  date: Date
  dayNumber: string
  isCurrentMonth: boolean
}

interface Props {
  events: CalendarEvent[]
  readOnly?: boolean
  locale?: string
  modalTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
  locale: 'en',
  modalTitle: 'Events',
})

const emit = defineEmits<{
  (e: 'new-event-click'): void
  (e: 'event-click', event: CalendarEvent): void
  (e: 'date-click', date: Date): void
}>()

const showAppointmentsModal = ref(false)
const selectedDate = ref<Date>(new Date())
const selectedDateEvents = computed(() => getEventsForDate(selectedDate.value))
const currentDate = ref<Date>(new Date())

const weekDays = computed(() => {
  const days =
    props.locale === 'fr'
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days
})

const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy')
})

const calendarDays = computed((): CalendarDay[] => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)

  let firstDay = start.getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1

  const realStart = subDays(start, firstDay)

  const endDay = end.getDay()
  const daysToAdd = endDay === 0 ? 0 : 7 - endDay
  const realEnd = addDays(end, daysToAdd)

  return eachDayOfInterval({ start: realStart, end: realEnd }).map((date) => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: isSameMonth(date, currentDate.value),
  }))
})

// Methods starts here
const hasEvents = (date: Date): boolean => {
  return props.events.some((evt) => isSameDay(new Date(evt.date), date))
}

const getEventsForDate = (date: Date): CalendarEvent[] => {
  return props.events.filter((evt) => isSameDay(new Date(evt.date), date))
}

const handleDateClick = (day: CalendarDay): void => {
  emit('date-click', day.date)
}

const handleEventClick = (event: CalendarEvent): void => {
  emit('event-click', event)
}

const openEventsModal = (date: Date) => {
  selectedDate.value = date
  showAppointmentsModal.value = true
}

const nextMonth = (): void => {
  currentDate.value = addMonths(currentDate.value, 1)
}

const previousMonth = (): void => {
  currentDate.value = subMonths(currentDate.value, 1)
}

const formatDate = (date: Date, formatString: string) => {
  return format(date, formatString)
}
</script>

<template>
  <div class="bg-sky-900/20 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-sky-700/20">
    <!-- Header avec mois et boutons -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <button @click="previousMonth" class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md">
          <span class="sr-only">Previous month</span>
          &lt;
        </button>
        <h2 class="text-xl font-semibold text-sky-900 w-48 text-center">{{ currentMonthYear }}</h2>
        <button @click="nextMonth" class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md">
          <span class="sr-only">Next month</span>
          &gt;
        </button>
      </div>

      <button v-if="!readOnly" @click="$emit('new-event-click')" class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md">
        New Appointment
      </button>
    </div>

    <!-- Grille du calendrier -->
    <div class="grid grid-cols-7 gap-px bg-sky-700/20 rounded-lg overflow-hidden">
      <!-- Jours de la semaine -->
      <div v-for="day in weekDays" :key="day" class="bg-sky-900/30 p-3 text-center text-sm font-semibold text-sky-900">
        {{ day }}
      </div>

      <!-- Jours du mois -->
      <div v-for="date in calendarDays" :key="date.date.toISOString()"
        :class="[
          'min-h-[120px] p-2 relative cursor-pointer',
          'transition-all duration-200 ease-in-out transform',
          date.isCurrentMonth ? 'bg-sky-900/5 hover:bg-sky-800/10' : 'bg-sky-900/20',
        ]"
      >
        <span :class="['absolute top-1 right-2 text-sm', date.isCurrentMonth ? 'text-sky-900' : 'text-sky-900/40']">
          {{ date.dayNumber }}
        </span>

        <!-- Bouton See Events si des événements existent -->
        <div v-if="hasEvents(date.date)" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <button @click.stop="openEventsModal(date.date)"
            class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
          >
            See Events
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showAppointmentsModal" class="fixed inset-0" @click="showAppointmentsModal = false">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50" @click.stop>
        <div class="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-medium text-sky-900">
              {{ props.modalTitle }} - {{ formatDate(selectedDate, 'MMMM d, yyyy') }}
            </h2>
            <button @click="showAppointmentsModal = false" class="text-sky-900/60 hover:text-sky-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <slot name="event-card" v-for="event in selectedDateEvents" :key="event.id" :event="event">
              <!-- Default event card if no slot provided -->
              <div class="bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="text-sky-900">
                  <div class="font-medium">{{ event.time }}</div>
                  <div>{{ event.title }}</div>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
