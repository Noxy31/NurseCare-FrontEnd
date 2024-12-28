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
  <div class="bg-white rounded-xl shadow-lg border border-sky-100">
    <!-- Header avec mois et boutons -->
    <div class="flex items-center justify-between p-4 sm:p-6 border-b border-sky-100">
      <div class="flex items-center gap-2">
        <button
          @click="previousMonth"
          class="bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium py-1 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200"
        >
          &lt;
        </button>
        <h2 class="text-sm sm:text-xl font-semibold text-sky-900 w-24 sm:w-48 text-center">
          {{ currentMonthYear }}
        </h2>
        <button
          @click="nextMonth"
          class="bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium py-1 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200"
        >
          &gt;
        </button>
      </div>

      <button
        v-if="!readOnly"
        @click="$emit('new-event-click')"
        class="bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium py-1 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
      >
        <span class="hidden sm:inline">New Appointment</span>
        <span class="sm:hidden">New</span>
      </button>
    </div>

    <!-- Grille du calendrier -->
    <div class="grid grid-cols-7 gap-px bg-sky-50">
      <!-- Jours de la semaine -->
      <div
        v-for="day in weekDays"
        :key="day"
        class="bg-sky-50 p-1 sm:p-3 text-center text-xs sm:text-sm font-semibold text-sky-900"
      >
        <span class="sm:hidden">{{ day.charAt(0) }}</span>
        <span class="hidden sm:inline">{{ day }}</span>
      </div>

      <!-- Jours du mois -->
      <div
        v-for="date in calendarDays"
        :key="date.date.toISOString()"
        :class="[
          'min-h-[45px] sm:min-h-[120px] p-1 sm:p-2 relative cursor-pointer bg-white',
          'transition-colors duration-200 ease-in-out',
          date.isCurrentMonth ? 'hover:bg-sky-50' : 'bg-gray-50',
        ]"
      >
        <span
          :class="[
            'absolute top-1 right-1 sm:right-2 text-xs sm:text-sm font-medium',
            date.isCurrentMonth ? 'text-sky-900' : 'text-sky-400',
          ]"
        >
          {{ date.dayNumber }}
        </span>

        <!-- Bouton See Events si des événements existent -->
        <div
          v-if="hasEvents(date.date)"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <button
            @click.stop="openEventsModal(date.date)"
            class="bg-sky-100 hover:bg-sky-200 text-sky-900 font-medium py-1 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm transition-colors duration-200"
          >
            <span class="hidden sm:inline">See Events</span>
            <span class="sm:hidden">View</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showAppointmentsModal" class="fixed inset-0 z-50" @click="showAppointmentsModal = false">
      <div class="absolute inset-0 bg-black/30" />
      <div
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
        @click.stop
      >
        <div class="bg-white p-6 sm:p-8 rounded-xl shadow-xl mx-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl sm:text-2xl font-medium text-sky-900">
              {{ props.modalTitle }} - {{ formatDate(selectedDate, 'MMMM d, yyyy') }}
            </h2>
            <button
              @click="showAppointmentsModal = false"
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

          <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <slot
              name="event-card"
              v-for="event in selectedDateEvents"
              :key="event.id"
              :event="event"
            >
              <div class="bg-white p-4 rounded-xl shadow border border-sky-100">
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
