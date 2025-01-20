<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Performance {
  idPerf: number
  perfName: string
  perfPrice: number
  idCat: number
}

interface Category {
  idCat: number
  catName: string
}

interface Trainee {
  idTrainee: number
  traineeName: string
  traineeFirstName: string
}

const props = defineProps<{
  show: boolean
  appointment: any
}>()

const emit = defineEmits(['close', 'update'])

const map = ref<L.Map>(null as unknown as L.Map)
const selectedCategory = ref<number | null>(null)
const categories = ref<Category[]>([])
const performances = ref<Performance[]>([])
const selectedPerformance = ref<number | null>(null)
const trainees = ref<Trainee[]>([])
const selectedTrainee = ref<number | null>(null)
const hasTrainee = ref(false)

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/perf/categories', {
      credentials: 'include',
    })
    if (response.ok) {
      categories.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchPerformancesByCategory = async () => {
  if (!selectedCategory.value) return
  try {
    const response = await fetch(`/api/perf/by-category/${selectedCategory.value}`, {
      credentials: 'include',
    })
    if (response.ok) {
      performances.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching performances:', error)
  }
}

const fetchTrainees = async () => {
  try {
    const response = await fetch('/api/trainee/all', {
      credentials: 'include',
    })
    if (response.ok) {
      trainees.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching trainees:', error)
  }
}

const checkTraineePresence = async () => {
  if (!props.appointment) return
  try {
    const response = await fetch(`/api/trainee/check-presence/${props.appointment.idApp}`, {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      hasTrainee.value = data.present
      selectedTrainee.value = data.traineeId || null
    }
  } catch (error) {
    console.error('Error checking trainee presence:', error)
  }
}

const initMap = () => {
  if (!props.appointment) return

  if (map.value) {
    map.value.remove()
  }

  const mapContainer = document.getElementById('map')
  if (mapContainer) {
    map.value = L.map(mapContainer).setView([0, 0], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    })

    fetchCoordinates(props.appointment.clientAddress)
  }
}

const fetchCoordinates = async (address: string) => {
  if (!map.value) return

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    )
    const data = await response.json()
    if (data && data[0]) {
      const { lat, lon } = data[0]
      const latNum = parseFloat(lat)
      const lonNum = parseFloat(lon)

      if (!isNaN(latNum) && !isNaN(lonNum)) {
        map.value.setView([latNum, lonNum], 13)
        L.marker([latNum, lonNum]).addTo(map.value as L.Map)
      }
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error)
  }
}

const saveAppointmentDetails = async () => {
  try {
    await fetch('/api/perf/save-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        idApp: props.appointment.idApp,
        idPerf: selectedPerformance.value,
        hasTrainee: hasTrainee.value,
        idTrainee: selectedTrainee.value,
      }),
    })
    emit('update')
    emit('close')
  } catch (error) {
    console.error('Error saving appointment details:', error)
  }
}

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      fetchCategories()
      fetchTrainees()
      checkTraineePresence()
      setTimeout(initMap, 100)
    } else {
      if (map.value) {
        map.value.remove()
        map.value = null as unknown as L.Map
      }
    }
  }
)

watch(
  () => selectedCategory.value,
  () => {
    fetchPerformancesByCategory()
  }
)
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">Appointment Details</h2>

      <div id="map" class="h-64 mb-6 rounded-lg"></div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block mb-2">Category</label>
          <select v-model="selectedCategory" class="w-full p-2 border rounded">
            <option value="">Select category</option>
            <option v-for="cat in categories" :key="cat.idCat" :value="cat.idCat">
              {{ cat.catName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-2">Performance</label>
          <select v-model="selectedPerformance" class="w-full p-2 border rounded">
            <option value="">Select performance</option>
            <option v-for="perf in performances" :key="perf.idPerf" :value="perf.idPerf">
              {{ perf.perfName }} - {{ perf.perfPrice }}€
            </option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <label class="flex items-center mb-2">
          <input type="checkbox" v-model="hasTrainee" class="mr-2" />
          Trainee present
        </label>

        <select v-if="hasTrainee" v-model="selectedTrainee" class="w-full p-2 border rounded">
          <option value="">Select trainee</option>
          <option v-for="trainee in trainees" :key="trainee.idTrainee" :value="trainee.idTrainee">
            {{ trainee.traineeName }} {{ trainee.traineeFirstName }}
          </option>
        </select>
      </div>

      <div class="flex justify-end gap-4">
        <button @click="emit('close')" class="px-4 py-2 border rounded">Cancel</button>
        <button @click="saveAppointmentDetails" class="px-4 py-2 bg-indigo-600 text-white rounded">
          Save
        </button>
      </div>
    </div>
  </div>
</template>
