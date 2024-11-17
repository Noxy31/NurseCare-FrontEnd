<script setup lang="ts">
import { ref, computed } from 'vue';
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
  addDays
} from 'date-fns';

interface CalendarEvent {
  id: number | string;
  date: Date;
  time: string;
  [key: string]: any;
}

interface CalendarDay {
  date: Date;
  dayNumber: string;
  isCurrentMonth: boolean;
}

interface Props {
  events: CalendarEvent[];
  readOnly?: boolean;
  locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
  locale: 'en'
});

const emit = defineEmits<{
  (e: 'new-event-click'): void;
  (e: 'event-click', event: CalendarEvent): void;
  (e: 'date-click', date: Date): void;
}>();

const currentDate = ref<Date>(new Date());

const weekDays = computed(() => {
  const days = props.locale === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days;
});

const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy');
});

const calendarDays = computed((): CalendarDay[] => {
  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);

  let firstDay = start.getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const realStart = subDays(start, firstDay);

  const endDay = end.getDay();
  const daysToAdd = endDay === 0 ? 0 : 7 - endDay;
  const realEnd = addDays(end, daysToAdd);

  return eachDayOfInterval({ start: realStart, end: realEnd }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: isSameMonth(date, currentDate.value)
  }));
});

// Methods
const hasEvents = (date: Date): boolean => {
  return props.events.some(evt => isSameDay(new Date(evt.date), date));
};

const getEventsForDate = (date: Date): CalendarEvent[] => {
  return props.events.filter(evt => isSameDay(new Date(evt.date), date));
};

const handleDateClick = (day: CalendarDay): void => {
  emit('date-click', day.date);
};

const handleEventClick = (event: CalendarEvent): void => {
  emit('event-click', event);
};

const nextMonth = (): void => {
  currentDate.value = addMonths(currentDate.value, 1);
};

const previousMonth = (): void => {
  currentDate.value = subMonths(currentDate.value, 1);
};
</script>

<template>
  <div class="bg-sky-900/20 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-sky-700/20">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button
          @click="previousMonth"
          class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span class="sr-only">Previous month</span>
          &lt;
        </button>
        <h2 class="text-xl font-semibold text-sky-900">{{ currentMonthYear }}</h2>
        <button
          @click="nextMonth"
          class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span class="sr-only">Next month</span>
          &gt;
        </button>
      </div>

      <button
        v-if="!readOnly"
        @click="$emit('new-event-click')"
        class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        New Appointment
      </button>
    </div>

    <div class="grid grid-cols-7 gap-px bg-sky-700/20 rounded-lg overflow-hidden">
      <div
        v-for="day in weekDays"
        :key="day"
        class="bg-sky-900/30 p-3 text-center text-sm font-semibold text-sky-900"
      >
        {{ day }}
      </div>

      <div
        v-for="date in calendarDays"
        :key="date.date.toISOString()"
        :class="[
          'min-h-[120px] p-2 relative transition-colors duration-200',
          date.isCurrentMonth ? 'bg-sky-900/5' : 'bg-sky-900/10',
          hasEvents(date.date) ? 'bg-sky-800/20' : ''
        ]"
        @click="!readOnly && handleDateClick(date)"
      >
        <span
          :class="[
            'absolute top-1 right-2 text-sm',
            date.isCurrentMonth ? 'text-sky-900' : 'text-sky-900/60'
          ]"
        >
          {{ date.dayNumber }}
        </span>

        <div class="mt-6 space-y-1">
          <div
            v-for="event in getEventsForDate(date.date)"
            :key="event.id"
            @click.stop="!readOnly && handleEventClick(event)"
            class="p-2 rounded text-xs cursor-pointer transition-colors duration-200 truncate bg-sky-700/40 hover:bg-sky-700/60 text-sky-900"
          >
            <div class="font-medium">{{ event.time }} - {{ event.title || 'Event' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
