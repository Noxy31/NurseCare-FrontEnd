# NBills.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import DynamicTable from '@/components/DataTab.vue'

const router = useRouter()
const userName = ref<string | null>(null)
const bills = ref([])

interface Bill {
  idBill: number
  billStatus: string
  totalAmount: number
  idApp: number
  appDate: string
  foresAppTime: string
  realAppTime: string | null
  idClient: number
  clientName: string
  clientAddress: string
  clientPhone: string
  clientMail: string
}

const nurseNavItems = [
  { name: 'Home', path: '/NHome', icon: 'Home' },
  { name: 'Agenda', path: '/NAgenda', icon: 'Calendar' },
  { name: 'Bills', path: '/NBills', icon: 'FileText' },
  { name: 'Profile', path: '/NProfile', icon: 'UserCircle' },
]

const tableHeaders = [
  { actual: 'appDate', display: 'Date' },
  { actual: 'foresAppTime', display: 'Time' },
  { actual: 'clientName', display: 'Client' },
  { actual: 'totalAmount', display: 'Amount (€)' },
  { actual: 'billStatus', display: 'Status' },
]

const statusMapping = {
  field: 'billStatus',
  values: {
    'pending': 'Pending',
    'paid': 'Paid',
    'cancelled': 'Cancelled'
  }
}

const fetchUserName = async () => {
  try {
    const response = await fetch('/api/users/me', {
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    const data = await response.json()
    userName.value = data.name
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
}

const fetchBills = async () => {
  try {
    const response = await fetch('/api/bill/get-bills', {
      credentials: 'include',
    })
    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch bills')
    }
    const data = await response.json()
    console.log('Bills received:', data) // Pour déboguer

    bills.value = data.map((bill: Bill) => ({
      ...bill,
      appDate: new Date(bill.appDate).toLocaleDateString(),
      foresAppTime: bill.foresAppTime.substring(0, 5),
      totalAmount: `${bill.totalAmount} €`,
    }))
  } catch (error) {
    console.error('Error fetching bills:', error)
  }
}

onMounted(() => {
  fetchUserName()
  fetchBills()
})
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-indigo-50">
    <NavBar :navItems="nurseNavItems" />
    <main class="p-4 sm:p-8 sm:pl-72 pt-20 sm:pt-8 w-full">

      <!-- Bills Section -->
      <div class="mt-6">
        <h2 class="text-2xl font-semibold text-indigo-900 mb-6">Bills Overview</h2>
        <DynamicTable
          :headers="tableHeaders"
          :items="bills"
          rowKey="idBill"
          :isClickable="false"
          :valueMappings="[statusMapping]"
        />
      </div>
    </main>
  </div>
</template>
