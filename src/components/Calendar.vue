<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarEvent {
  id: number | string;
  date: Date;
  time: string;
  title: string;
  description?: string;
  color?: string;
  [key: string]: any;
}

interface CalendarDay {
  date: Date;
  dayNumber: string;
  isCurrentMonth: boolean;
}

interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'time';
  options?: Array<{ value: string | number; label: string }>;
}

interface EventForm {
  date: string;
  time: string;
  title: string;
  description?: string;
  [key: string]: any;
}


interface Props {
  events: CalendarEvent[];
  customFields?: CustomField[];
  readOnly?: boolean;
  locale?: string;
  addEventButtonLabel?: string;
  modalCreateTitle?: string;
  modalEditTitle?: string;
  createButtonLabel?: string;
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  customFields: () => [],
  readOnly: false,
  locale: 'fr',
  addEventButtonLabel: 'Nouvel événement',
  modalCreateTitle: 'Nouvel événement',
  modalEditTitle: 'Modifier l\'événement',
  createButtonLabel: 'Créer',
  saveButtonLabel: 'Enregistrer',
  cancelButtonLabel: 'Annuler'
});

const emit = defineEmits<{
  (e: 'event-created', event: Omit<CalendarEvent, 'id'>): void;
  (e: 'event-updated', event: CalendarEvent): void;
  (e: 'date-selected', date: Date): void;
  (e: 'event-selected', event: CalendarEvent): void;
}>();

// État
const currentDate = ref<Date>(new Date());
const showEventModal = ref<boolean>(false);
const editingEvent = ref<CalendarEvent | null>(null);
  const eventForm = ref<EventForm>({
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '',
  title: '',
  description: ''
});

// Jours de la semaine selon la locale
const weekDays = computed(() => {
  const days = props.locale === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days;
});

// Computed properties
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy', {
    locale: props.locale === 'fr' ? fr : undefined
  });
});

const calendarDays = computed((): CalendarDay[] => {
  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);

  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    dayNumber: format(date, 'd'),
    isCurrentMonth: true
  }));
});

// Méthodes
const hasEvents = (date: Date): boolean => {
  return props.events.some(evt => isSameDay(new Date(evt.date), date));
};

const getEventsForDate = (date: Date): CalendarEvent[] => {
  return props.events.filter(evt => isSameDay(new Date(evt.date), date));
};

const handleDateClick = (day: CalendarDay): void => {
  emit('date-selected', day.date);
};

const nextMonth = (): void => {
  currentDate.value = addMonths(currentDate.value, 1);
};

const previousMonth = (): void => {
  currentDate.value = subMonths(currentDate.value, 1);
};

const openNewEventModal = (): void => {
  editingEvent.value = null;
  eventForm.value = {
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    title: '',
    description: '',
    ...props.customFields?.reduce((acc, field) => ({
      ...acc,
      [field.name]: ''
    }), {})
  };
  showEventModal.value = true;
};

const editEvent = (event: CalendarEvent): void => {
  emit('event-selected', event);
  editingEvent.value = event;
  eventForm.value = {
    date: format(new Date(event.date), 'yyyy-MM-dd'),
    time: event.time,
    title: event.title,
    description: event.description,
    ...props.customFields?.reduce((acc, field) => ({
      ...acc,
      [field.name]: event[field.name as keyof CalendarEvent]
    }), {})
  };
  showEventModal.value = true;
};

const saveEvent = (): void => {
  const eventData = {
    date: new Date(eventForm.value.date),
    time: eventForm.value.time,
    title: eventForm.value.title,
    description: eventForm.value.description,
    ...props.customFields?.reduce((acc, field) => ({
      ...acc,
      [field.name]: eventForm.value[field.name]
    }), {})
  };

  if (editingEvent.value) {
    emit('event-updated', { ...eventData, id: editingEvent.value.id });
  } else {
    emit('event-created', eventData);
  }

  closeModal();
};

const closeModal = (): void => {
  showEventModal.value = false;
  editingEvent.value = null;
  eventForm.value = {
    date: '',
    time: '',
    title: '',
    description: ''
  };
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
          <span class="sr-only">Mois précédent</span>
          &lt;
        </button>
        <h2 class="text-xl font-semibold text-sky-900">{{ currentMonthYear }}</h2>
        <button
          @click="nextMonth"
          class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span class="sr-only">Mois suivant</span>
          &gt;
        </button>
      </div>

      <button
        v-if="!readOnly"
        @click="openNewEventModal"
        class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        {{ addEventButtonLabel }}
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
            @click.stop="!readOnly && editEvent(event)"
            :class="[
              'p-2 rounded text-xs cursor-pointer transition-colors duration-200 truncate',
              event.color || 'bg-sky-700/40 hover:bg-sky-700/60 text-sky-900'
            ]"
          >
            <div class="font-medium">{{ event.time }} - {{ event.title }}</div>
            <div v-if="event.description" class="text-xs opacity-75 truncate">
              {{ event.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal générique pour ajouter/éditer un événement -->
    <div
      v-if="showEventModal"
      class="fixed inset-0 bg-sky-900/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 class="text-xl font-semibold text-sky-900 mb-4">
          {{ editingEvent ? modalEditTitle : modalCreateTitle }}
        </h3>

        <form @submit.prevent="saveEvent" class="space-y-4">
          <!-- Champs par défaut -->
          <div>
            <label class="block text-sm font-medium text-sky-900 mb-1">Date</label>
            <input
              type="date"
              v-model="eventForm.date"
              class="w-full p-2 border border-sky-700/30 rounded-lg bg-sky-900/10 text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-sky-900 mb-1">Heure</label>
            <input
              type="time"
              v-model="eventForm.time"
              class="w-full p-2 border border-sky-700/30 rounded-lg bg-sky-900/10 text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-sky-900 mb-1">Titre</label>
            <input
              type="text"
              v-model="eventForm.title"
              class="w-full p-2 border border-sky-700/30 rounded-lg bg-sky-900/10 text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-sky-900 mb-1">Description</label>
            <textarea
              v-model="eventForm.description"
              class="w-full p-2 border border-sky-700/30 rounded-lg bg-sky-900/10 text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
              rows="2"
            ></textarea>
          </div>

          <!-- Champs personnalisés dynamiques -->
          <template v-for="field in customFields" :key="field.name">
            <div>
              <label class="block text-sm font-medium text-sky-900 mb-1">{{ field.label }}</label>

              <template v-if="field.type === 'select'">
                <select
                  v-model="eventForm[field.name]"
                  class="w-full p-2 border border-sky-700/30 rounded-lg bg-sky-900/10 text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
                >
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </template>

              <template v-else>
                <input
                  :type="field.type"
                  v-model="eventForm[field.name]"
                  class="w-full p-2 border border-sky-700/30 rounded-lg bg-sky-900/10 text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
                />
              </template>
            </div>
          </template>

          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="bg-sky-800/40 hover:bg-sky-800/60 text-sky-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {{ cancelButtonLabel }}
            </button>
            <button
              type="submit"
              class="bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {{ editingEvent ? saveButtonLabel : createButtonLabel }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
