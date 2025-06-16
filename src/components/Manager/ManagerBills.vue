<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DataTable from '../DataTab.vue'
import NavBar from '@/components/NavBar.vue'
import type { TableItem } from '../DataTab.vue'
import ToastNotification from '../ToastNotification.vue'

type BillStatus = 'Pending' | 'Accepted' | 'Paid'

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

const managerNavItems = [
  { name: 'Overview', path: '/MHome', icon: 'Home' },
  { name: 'Agenda', path: '/MAgenda', icon: 'Calendar' },
  { name: 'Users', path: '/MUsers', icon: 'UserCog' },
  { name: 'Trainee', path: '/MTrainee', icon: 'UserPen' },
  { name: 'Bills', path: '/MBills', icon: 'FileText' },
]

const statusMapping = {
  field: 'billStatus',
  values: {
    Pending: 'Pending',
    Accepted: 'Accepted',
    Paid: 'Paid',
  } as Record<BillStatus, string>,
}

const dateMapping = computed(() => ({
  field: 'appDate',
  values: bills.value.reduce((acc, bill) => {
    acc[bill.appDate] = formatDate(bill.appDate)
    return acc
  }, {} as Record<string, string>)
}))

const fetchBills = async () => {
  try {
    const response = await fetch('/api/bill/get-all-bills', {
      credentials: 'include',
    })
    if (response.ok) {
      bills.value = await response.json()
    } else {
      showNotification('Error fetching bills', 'error')
    }
  } catch (error) {
    showNotification('Error connecting to server', 'error')
  }
}

onMounted(fetchBills)

const handleDelete = async (id: number) => {
  const confirmed = confirm('Are you sure that you want to delete this bill?')
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch(`/api/bill/delete-bill/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (response.ok) {
      bills.value = bills.value.filter((bill) => bill.idBill !== id)
      showNotification('Bill successfully deleted', 'success')
    } else {
      showNotification('Error deleting bill', 'error')
    }
  } catch (error) {
    showNotification('Error connecting to server', 'error')
  }
}

const handleUpdate = async (item: TableItem) => {
  const bill = item as Bill
  try {
    const response = await fetch('/api/bill/update-bill', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idBill: bill.idBill,
        billStatus: bill.billStatus,
        totalAmount: parseFloat(bill.totalAmount.toString().replace(/[^0-9.-]+/g, '')),
      }),
    })

    if (response.ok) {
      await fetchBills()
      showNotification('Bill successfully updated', 'success')
    } else {
      showNotification('Error updating bill', 'error')
    }
  } catch (error) {
    showNotification('Error connecting to server', 'error')
  }
}

const handleRowClick = (item: TableItem) => {
  selectedBill.value = item as Bill
  showModal.value = true
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US')
}

const formatTime = (time: string) => {
  return time.substring(0, 5)
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const getStatusDisplay = (status: BillStatus): string => {
  return statusMapping.values[status]
}

const originalBills = ref<Bill[]>([])


const handleCancel = (item: TableItem) => {
  const originalBill = originalBills.value.find((bill) => bill.idBill === item.idBill)
  if (originalBill) {
    Object.assign(item, originalBill)
  }
}
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <NavBar :navItems="managerNavItems" class="fixed z-50" />

    <main class="flex-1 w-full min-w-0 p-4 sm:ml-64 sm:p-6">
      <ToastNotification
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />

      <div
        class="min-w-0 bg-white/30 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40"
      >
        <div>
          <h2 class="text-xl sm:text-2xl font-medium text-sky-900 mb-4">Bills List</h2>
          <p class="text-sm text-sky-900/70 italic mb-4">
            *The status of a bill must be: pending, accepted or paid only.
          </p>
          <div class="overflow-x-auto min-w-0">
            <DataTable
              :headers="[
                { actual: 'idBill', display: 'Bill N°' },
                { actual: 'billStatus', display: 'Status' },
                { actual: 'totalAmount', display: 'Amount' },
                { actual: 'clientName', display: 'Patient' },
                { actual: 'appDate', display: 'Appointment Date' },
              ]"
              :items="bills"
              rowKey="idBill"
              :read-only="false"
              :editableFields="['billStatus']"
              @delete="handleDelete"
              @update="handleUpdate"
              @cancel="handleCancel"
              @row-click="handleRowClick"
              :valueMappings="[statusMapping, dateMapping]"
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
          <div
            class="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4"
          >
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium text-sky-900">
                Bill Details #{{ selectedBill.idBill }}
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
                  <h3 class="font-medium text-sky-900">Patient Information</h3>
                  <p>{{ selectedBill.clientName }}</p>
                  <p>{{ selectedBill.clientAddress }}</p>
                  <p>{{ selectedBill.clientPhone }}</p>
                  <p>{{ selectedBill.clientMail }}</p>
                </div>
                <div>
                  <h3 class="font-medium text-sky-900">Appointment Information</h3>
                  <p>Date: {{ formatDate(selectedBill.appDate) }}</p>
                  <p>Scheduled Time: {{ formatTime(selectedBill.foresAppTime) }}</p>
                  <p>Actual Time: {{ formatTime(selectedBill.realAppTime) }}</p>
                </div>
              </div>
              <div>
                <h3 class="font-medium text-sky-900">Bill Information</h3>
                <p>Status: {{ getStatusDisplay(selectedBill.billStatus) }}</p>
                <p>Amount: {{ formatAmount(selectedBill.totalAmount) }}</p>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                @click="showModal = false"
                class="px-4 py-2 bg-sky-900/10 hover:bg-sky-900/20 text-sky-900 rounded-lg transition-colors"
              >
                Close
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
