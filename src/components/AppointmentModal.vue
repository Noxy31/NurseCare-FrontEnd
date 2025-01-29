<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import type { Map as LeafletMap, LatLngExpression, Marker, Polyline } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Toast from './ToastNotification.vue'

interface Performance {
  idPerf: number
  perfName: string
  perfPrice: number
  idCategory: number
}

interface ToastPayload {
  message: string
  type: 'success' | 'error'
}

interface Category {
  idCategory: number
  catName: string
}

interface Trainee {
  idTrainee: number
  traineeName: string
  traineeFirstName: string
}

interface Appointment {
  idApp: number
  clientAddress: string
}

const props = defineProps<{
  show: boolean
  appointment: Appointment | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update'): void
  (e: 'toast', payload: ToastPayload): void
}>()

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const TOULOUSE_CENTER: LatLngExpression = [43.6044, 1.4417]
const TOULOUSE_BOUNDS = {
  north: 43.65,
  south: 43.55,
  east: 1.5,
  west: 1.38,
}

const startIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const endIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<LeafletMap | null>(null)
const startMarker = ref<Marker | null>(null)
const endMarker = ref<Marker | null>(null)
const routeLine = ref<Polyline | null>(null)
const lastLocation = ref<LatLngExpression | null>(null)
const isSaving = ref(false)
const selectedCategory = ref<number | null>(null)
const categories = ref<Category[]>([])
const performances = ref<Performance[]>([])
const selectedPerformance = ref<number | null>(null)
const selectedPerformances = ref<Performance[]>([])
const trainees = ref<Trainee[]>([])
const selectedTrainee = ref<number | null>(null)
const hasTrainee = ref(false)

const totalPrice = computed(() => {
  return selectedPerformances.value.reduce((sum, perf) => sum + perf.perfPrice, 0).toFixed(2)
})

const generateRandomLocation = (): LatLngExpression => {
  const lat =
    TOULOUSE_BOUNDS.south + Math.random() * (TOULOUSE_BOUNDS.north - TOULOUSE_BOUNDS.south)
  const lng = TOULOUSE_BOUNDS.west + Math.random() * (TOULOUSE_BOUNDS.east - TOULOUSE_BOUNDS.west)
  return [lat, lng]
}

const getRoute = async (
  start: LatLngExpression,
  end: LatLngExpression
): Promise<LatLngExpression[] | null> => {
  try {
    const startCoords = Array.isArray(start) ? start : [start.lat, start.lng]
    const endCoords = Array.isArray(end) ? end : [end.lat, end.lng]

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`
    )
    const data = await response.json()

    if (!data.routes?.[0]?.geometry?.coordinates) {
      throw new Error('No route found')
    }

    return data.routes[0].geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression
    )
  } catch (error) {
    console.error("Erreur lors de la récupération de l'itinéraire:", error)
    return null
  }
}

const clearMap = () => {
  if (!map.value) return

  if (startMarker.value) startMarker.value.remove()
  if (endMarker.value) endMarker.value.remove()
  if (routeLine.value) routeLine.value.remove()

  startMarker.value = null
  endMarker.value = null
  routeLine.value = null
}

const updateRoute = async () => {
  if (!map.value) return

  clearMap()

  const startPoint = lastLocation.value || generateRandomLocation()
  const endPoint = generateRandomLocation()

  startMarker.value = L.marker(startPoint, {
    icon: startIcon,
    title: 'Votre position',
  }).addTo(map.value as L.Map)

  endMarker.value = L.marker(endPoint, {
    icon: endIcon,
    title: props.appointment?.clientAddress || 'Destination',
  }).addTo(map.value as L.Map)

  const routeCoordinates = await getRoute(startPoint, endPoint)
  if (routeCoordinates) {
    routeLine.value = L.polyline(routeCoordinates, {
      color: '#4F46E5',
      weight: 4,
      opacity: 0.8,
    }).addTo(map.value as L.Map)

    map.value.fitBounds(routeLine.value.getBounds(), { padding: [50, 50] })
  }

  lastLocation.value = endPoint
}

const initMap = () => {
  if (!mapContainer.value || map.value) return

  map.value = L.map(mapContainer.value, {
    center: TOULOUSE_CENTER,
    zoom: 12,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map.value as L.Map)

  const Legend = L.Control.extend({
    onAdd: () => {
      const div = L.DomUtil.create('div', 'legend')
      div.innerHTML = `
        <div class="legend-item">
          <div class="legend-color" style="background: #2563eb;"></div>
          <span>Votre position</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #dc2626;"></div>
          <span>Destination</span>
        </div>
      `
      return div
    },
  })

  new Legend({ position: 'bottomright' }).addTo(map.value as L.Map)
  updateRoute()
}

const addPerformance = () => {
  if (!selectedPerformance.value) return

  const performanceToAdd = performances.value.find((p: Performance) => p.idPerf === selectedPerformance.value)
  if (performanceToAdd) {
    selectedPerformances.value.push({
      ...performanceToAdd,
      perfPrice: Number(performanceToAdd.perfPrice),
    })

    // Reset des sélections
    selectedPerformance.value = null
    selectedCategory.value = null
    performances.value = []
  }
}

const removePerformance = (index: number) => {
  selectedPerformances.value.splice(index, 1)
}

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories/get-categories', {
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    categories.value = await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchPerformancesByCategory = async () => {
  if (!selectedCategory.value) {
    performances.value = []
    return
  }

  try {
    const response = await fetch(`/api/perf/by-category/${selectedCategory.value}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    performances.value = await response.json()
  } catch (error) {
    console.error('Error fetching performances:', error)
    performances.value = []
  }
}

const fetchTrainees = async () => {
  try {
    const response = await fetch('/api/trainee/all', {
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    trainees.value = await response.json()
  } catch (error) {
    console.error('Error fetching trainees:', error)
    trainees.value = []
  }
}

const checkTraineePresence = async () => {
  if (!props.appointment?.idApp) return

  try {
    const response = await fetch(`/api/trainee/check-presence/${props.appointment.idApp}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    hasTrainee.value = data.present
    selectedTrainee.value = data.traineeId || null
  } catch (error) {
    console.error('Error checking trainee presence:', error)
    hasTrainee.value = false
    selectedTrainee.value = null
  }
}

const saveAppointmentDetails = async () => {
  if (!props.appointment?.idApp || selectedPerformances.value.length === 0 || !lastLocation.value) {
    toastMessage.value = 'Data missing'
    toastType.value = 'error'
    showToast.value = true
    return
  }
// On evite les doubles soumissions avec isSaving
  if (isSaving.value) return
  isSaving.value = true

  try {
    const response = await fetch('/api/perf/save-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        idApp: props.appointment.idApp,
        performances: selectedPerformances.value.map((perf: Performance) => ({
          idPerf: perf.idPerf,
        })),
        hasTrainee: hasTrainee.value,
        idTrainee: hasTrainee.value ? selectedTrainee.value : null,
        coordinates: lastLocation.value,
      }),
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    toastMessage.value = 'Appointment details saved'
    toastType.value = 'success'
    showToast.value = true

    emit('update')
    emit('close')
  } catch (error) {
    console.error('Error saving appointment details:', error)
    toastMessage.value = "Error saving appointment details"
    toastType.value = 'error'
    showToast.value = true
  } finally {
    isSaving.value = false
  }
}

// Lifecycle hooks et watchers
onMounted(() => {
  if (props.show) {
    nextTick(() => {
      initMap()
    })
  }
})

onUnmounted(() => {
  if (map.value) {
    clearMap()
    map.value.remove()
    map.value = null
  }
})

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      selectedPerformance.value = null
      selectedPerformances.value = [] // Reset des prestations sélectionnées
      fetchCategories()
      fetchTrainees()
      checkTraineePresence()
      nextTick(() => {
        initMap()
      })
    } else {
      if (map.value) {
        clearMap()
        map.value.remove()
        map.value = null
      }
    }
  }
)

watch(
  () => selectedCategory.value,
  () => {
    selectedPerformance.value = null
    fetchPerformancesByCategory()
  }
)
</script>

<template>
  <div>
    <!-- Composant Toast -->
    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      :duration="3000"
      @close="showToast = false"
    />

    <!-- Modal -->
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Détails du rendez-vous</h2>

        <div class="h-64 mb-6 rounded-lg overflow-hidden">
          <div ref="mapContainer" class="w-full h-full"></div>
        </div>

        <div v-if="selectedPerformances.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold mb-2">Prestations sélectionnées :</h3>
          <div class="space-y-2">
            <div
              v-for="(perf, index) in selectedPerformances"
              :key="perf.idPerf + '-' + index"
              class="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <span>{{ perf.perfName }} - {{ Number(perf.perfPrice).toFixed(2) }}€</span>
              <button @click="removePerformance(index)" class="text-red-600 hover:text-red-800">
                Supprimer
              </button>
            </div>
          </div>
          <div class="mt-2 text-right">
            <p class="font-semibold">Total: {{ totalPrice }}€</p>
          </div>
        </div>

        <!-- Sélection des prestations -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block mb-2">Catégorie</label>
            <select v-model="selectedCategory" class="w-full p-2 border rounded">
              <option :value="null">Sélectionner une catégorie</option>
              <option v-for="cat in categories" :key="cat.idCategory" :value="cat.idCategory">
                {{ cat.catName }}
              </option>
            </select>
          </div>

          <div>
            <label class="block mb-2">Prestation</label>
            <select
              v-model="selectedPerformance"
              class="w-full p-2 border rounded"
              :disabled="!selectedCategory"
            >
              <option :value="null">Sélectionner une prestation</option>
              <option v-for="perf in performances" :key="perf.idPerf" :value="perf.idPerf">
                {{ perf.perfName }} - {{ perf.perfPrice }}€
              </option>
            </select>
          </div>
        </div>

        <!-- Bouton pour ajouter la prestation -->
        <div class="flex justify-end mb-6">
          <button
            @click="addPerformance"
            :disabled="!selectedPerformance"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            + Ajouter la prestation
          </button>
        </div>

        <div class="mb-6">
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="hasTrainee" class="mr-2" />
            Stagiaire présent
          </label>

          <select v-if="hasTrainee" v-model="selectedTrainee" class="w-full p-2 border rounded">
            <option :value="null">Sélectionner un stagiaire</option>
            <option v-for="trainee in trainees" :key="trainee.idTrainee" :value="trainee.idTrainee">
              {{ trainee.traineeName }} {{ trainee.traineeFirstName }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-4">
          <button @click="emit('close')" class="px-4 py-2 border rounded hover:bg-gray-100">
            Annuler
          </button>
          <button
            @click="saveAppointmentDetails"
            :disabled="selectedPerformances.length === 0 || isSaving"
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <span v-if="isSaving">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import 'leaflet/dist/leaflet.css';

.leaflet-container {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
}

.legend {
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 4px 0;
  font-size: 12px;
}

.legend-color {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
}
</style>
