<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordonnées de Toulouse
const TOULOUSE_COORDINATES: [number, number] = [43.6044, 1.4417] // Rue du Taur

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

interface Appointment {
  idApp: number
  clientAddress: string
}

const props = defineProps<{
  show: boolean
  appointment: Appointment | null
}>()

const emit = defineEmits(['close', 'update'])

// Génération de coordonnées aléatoires autour de Toulouse
const generateRandomCoordinates = () => {
  const latVariation = (Math.random() - 0.5) * 0.06
  const lngVariation = (Math.random() - 0.5) * 0.06

  return [
    TOULOUSE_COORDINATES[0] + latVariation,
    TOULOUSE_COORDINATES[1] + lngVariation
  ] as [number, number]
}

// Refs pour la carte
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const marker = ref<L.Marker | null>(null)
const center = ref<L.LatLngExpression>(generateRandomCoordinates())
const zoom = ref(13)

// Type pour la carte Leaflet
type LeafletMap = L.Map

// Refs pour les données
const selectedCategory = ref<number | null>(null)
const categories = ref<Category[]>([])
const performances = ref<Performance[]>([])
const selectedPerformance = ref<number | null>(null)
const trainees = ref<Trainee[]>([])
const selectedTrainee = ref<number | null>(null)
const hasTrainee = ref(false)

// Initialisation de la carte
const initMap = () => {
  if (!mapContainer.value) return

  // Création de la carte
  const newMap: LeafletMap = L.map(mapContainer.value)
  map.value = newMap
  newMap.setView(center.value, zoom.value)

  // Ajout du layer OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(newMap)

  // Ajout du marker
  const newMarker = L.marker(center.value, {
    title: props.appointment?.clientAddress || 'Adresse client'
  })
  marker.value = newMarker
  newMarker.addTo(newMap)

  // Gestion du clic sur la carte
  map.value.on('click', (e: L.LeafletMouseEvent) => {
    const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
    center.value = newPos
    marker.value?.setLatLng(newPos)
  })
}

// Nettoyage de la carte
const cleanupMap = () => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

// Appels API
const fetchCategories = async () => {
  try {
    const response = await fetch('/api/perf/categories', {
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
  if (!props.appointment?.idApp || !selectedPerformance.value) {
    console.error('Missing required data')
    return
  }

  try {
    const response = await fetch('/api/perf/save-appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        idApp: props.appointment.idApp,
        idPerf: selectedPerformance.value,
        hasTrainee: hasTrainee.value,
        idTrainee: hasTrainee.value ? selectedTrainee.value : null,
        coordinates: center.value
      }),
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    emit('update')
    emit('close')
  } catch (error) {
    console.error('Error saving appointment details:', error)
  }
}

// Gestion du cycle de vie
onMounted(() => {
  if (props.show) {
    nextTick(() => {
      initMap()
    })
  }
})

onUnmounted(() => {
  cleanupMap()
})

// Watchers
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // Reset des valeurs
      selectedPerformance.value = null
      center.value = generateRandomCoordinates()

      // Chargement des données
      fetchCategories()
      fetchTrainees()
      checkTraineePresence()

      // Initialisation de la carte
      nextTick(() => {
        initMap()
      })
    } else {
      cleanupMap()
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

watch(
  () => center.value,
  (newPos) => {
    marker.value?.setLatLng(newPos)
    map.value?.setView(newPos, zoom.value)
  }
)
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">Détails du rendez-vous</h2>

      <div class="h-64 mb-6 rounded-lg overflow-hidden">
        <div ref="mapContainer" class="w-full h-full"></div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block mb-2">Catégorie</label>
          <select v-model="selectedCategory" class="w-full p-2 border rounded">
            <option :value="null">Sélectionner une catégorie</option>
            <option v-for="cat in categories" :key="cat.idCat" :value="cat.idCat">
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

      <div class="mb-6">
        <label class="flex items-center mb-2">
          <input type="checkbox" v-model="hasTrainee" class="mr-2" />
          Stagiaire présent
        </label>

        <select
          v-if="hasTrainee"
          v-model="selectedTrainee"
          class="w-full p-2 border rounded"
        >
          <option :value="null">Sélectionner un stagiaire</option>
          <option v-for="trainee in trainees" :key="trainee.idTrainee" :value="trainee.idTrainee">
            {{ trainee.traineeName }} {{ trainee.traineeFirstName }}
          </option>
        </select>
      </div>

      <div class="flex justify-end gap-4">
        <button
          @click="emit('close')"
          class="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Annuler
        </button>
        <button
          @click="saveAppointmentDetails"
          :disabled="!selectedPerformance"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          Enregistrer
        </button>
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
</style>
