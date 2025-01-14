<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '../DataTab.vue'
import NavBar from '@/components/NavBar.vue'
import type { TableItem } from '../DataTab.vue'
import ToastNotification from '../ToastNotification.vue'

type BillStatus = 'pending' | 'paid' | 'cancelled'

interface Bill extends TableItem {
  idBill: number
  billStatus: BillStatus
  totalAmount: number
  idApp: number
  appDate: string
  foresAppTime: string
  realAppTime: string
  idClient: number
  clientName: string
  clientAddress: string
  clientPhone: string
  clientMail: string
}

const bills = ref<Bill[]>([])
const showModal = ref(false)
const selectedBill = ref<Bill | null>(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showNotification = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const secretaryNavItems = [
  { name: 'Home', path: '/SHome', icon: 'Home' },
  { name: 'Planning', path: '/SPlanning', icon: 'Calendar' },
  { name: 'Bills', path: '/SBills', icon: 'Receipt' },
  { name: 'Patients', path: '/patients', icon: 'Users' },
  { name: 'Users', path: '/users', icon: 'UserCog' },
]

// Status mapping for the table
const statusMapping = {
  field: 'billStatus',
  values: {
    pending: 'En attente',
    paid: 'Payée',
    cancelled: 'Annulée'
  } as Record<BillStatus, string>
}

onMounted(async () => {
  try {
    const response = await fetch('/api/get-bills', {
      credentials: 'include'
    })
    if (response.ok) {
      bills.value = await response.json()
    } else {
      showNotification('Error fetching bills', 'error')
    }
  } catch (error) {
    showNotification('Error connecting to server', 'error')
  }
})

const handleRowClick = (item: TableItem) => {
  selectedBill.value = item as Bill
  showModal.value = true
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatTime = (time: string) => {
  return time.substring(0, 5)
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const getStatusDisplay = (status: BillStatus): string => {
  return statusMapping.values[status]
}
</script>

<template>
  <div class="flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <NavBar :navItems="secretaryNavItems" class="fixed z-50" />

    <main class="flex-1 w-full min-w-0 p-4 sm:ml-64 sm:p-6">
      <ToastNotification
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />

      <div class="min-w-0 bg-white/30 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40">
        <div>
          <h2 class="text-xl sm:text-2xl font-medium text-sky-900 mb-4">Liste des factures</h2>
          <div class="overflow-x-auto min-w-0">
            <DataTable
              :headers="[
                { actual: 'idBill', display: 'N° Facture' },
                { actual: 'billStatus', display: 'Statut' },
                { actual: 'totalAmount', display: 'Montant' },
                { actual: 'clientName', display: 'Patient' },
                { actual: 'appDate', display: 'Date RDV' },
              ]"
              :items="bills.map(bill => ({
                ...bill,
                totalAmount: formatAmount(bill.totalAmount),
                appDate: formatDate(bill.appDate)
              }))"
              rowKey="idBill"
              :isClickable="true"
              @row-click="handleRowClick"
              :valueMappings="[statusMapping]"
            />
          </div>
        </div>
      </div>

      <!-- Modal -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          @click="showModal = false"
        />
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
          v-if="showModal && selectedBill"
          class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50"
          @click.stop
        >
          <div class="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium text-sky-900">
                Détails de la facture #{{ selectedBill.idBill }}
              </h2>
              <button
                @click="showModal = false"
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
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h3 class="font-medium text-sky-900">Informations patient</h3>
                  <p>{{ selectedBill.clientName }}</p>
                  <p>{{ selectedBill.clientAddress }}</p>
                  <p>{{ selectedBill.clientPhone }}</p>
                  <p>{{ selectedBill.clientMail }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Informations rendez-vous</h3>
                  <p>Date : {{ formatDate(selectedBill.appDate) }}</p>
                  <p>Heure prévue : {{ formatTime(selectedBill.foresAppTime) }}</p>
                  <p>Heure réelle : {{ formatTime(selectedBill.realAppTime) }}</p>
                </div>
              </div>
              <div>
                <h3 class="font-medium text-sky-900">Informations facture</h3>
                <p>Statut : {{ getStatusDisplay(selectedBill.billStatus) }}</p>
                <p>Montant : {{ formatAmount(selectedBill.totalAmount) }}</p>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                @click="showModal = false"
                class="px-4 py-2 bg-sky-900/10 hover:bg-sky-900/20 text-sky-900 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(186, 230, 253, 0.4) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(186, 230, 253, 0.4);
  border-radius: 20px;
  border: transparent;
}
</style>
