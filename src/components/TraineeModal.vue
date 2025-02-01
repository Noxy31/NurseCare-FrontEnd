<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TableItem } from '@/components/DataTab.vue'

interface Rating {
  idApp: number
  ratingTicket: number
  commentTicket: string
  idTrainee: number
}

// On étend TableItem pour le typage du trainee
interface TraineeItem extends TableItem {
  idTrainee: number
  traineeName: string
  traineeFirstName: string
}

interface Props {
  trainee: TableItem | null
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const ratings = ref<Rating[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchRatings = async (idTrainee: number) => {
  if (!idTrainee) return

  try {
    isLoading.value = true
    error.value = null
    const response = await fetch(`/api/trainee/ratings/${idTrainee}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch ratings')

    const data = await response.json()
    ratings.value = data
  } catch (err) {
    error.value = 'Failed to load ratings'
    console.error('Error fetching ratings:', err)
  } finally {
    isLoading.value = false
  }
}

// On utilise la vérification de type pour garantir que les propriétés existent
const isValidTrainee = (trainee: TableItem | null): trainee is TraineeItem => {
  return trainee !== null &&
         typeof trainee.idTrainee === 'number' &&
         typeof trainee.traineeName === 'string' &&
         typeof trainee.traineeFirstName === 'string'
}

watch(() => props.trainee, (newTrainee) => {
  if (isValidTrainee(newTrainee)) {
    fetchRatings(newTrainee.idTrainee)
  } else {
    ratings.value = []
  }
}, { immediate: true })
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" @click="$emit('close')" />
  </transition>

  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen && isValidTrainee(trainee)"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50"
      @click.stop
    >
      <div class="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium text-sky-900">
            {{ trainee?.traineeFirstName }} {{ trainee?.traineeName }}'s Ratings
          </h2>
          <button
            @click="$emit('close')"
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

        <div class="space-y-4">
          <div v-if="isLoading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-900 mx-auto"></div>
          </div>

          <div v-else-if="error" class="text-center py-8 text-red-500">
            {{ error }}
          </div>

          <div v-else-if="ratings.length === 0" class="text-center py-8 text-sky-900/60">
            No ratings available for this trainee.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="rating in ratings"
              :key="rating.idApp"
              class="bg-white/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-sky-900 font-medium">Rating:</span>
                  <div class="flex items-center">

                    <span class="ml-2 text-sm text-sky-900"> {{ rating.ratingTicket }}/20 </span>
                  </div>
                </div>
                <span class="text-sm text-sky-900/60">ID: {{ rating.idApp }}</span>
              </div>
              <div class="mt-2">
                <p class="text-sky-900 whitespace-pre-wrap">{{ rating.commentTicket }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
