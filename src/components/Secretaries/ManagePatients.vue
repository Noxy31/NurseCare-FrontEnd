<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '../DataTab.vue'
import NavBar from '@/components/NavBar.vue'
import type { TableItem } from '../DataTab.vue'
import DynamicForm from '../DynamicForm.vue'
import type { FormField } from '../DynamicForm.vue'
import ToastNotification from '../ToastNotification.vue'
import { useRouter } from 'vue-router'

interface Client {
  idClient: number
  clientName: string
  clientAddress: string
  clientPhone: string
  clientMail: string
}

interface CreateUserFormData {
  clientName: string
  clientMail: string
  clientPhone: string
  clientAddress: string
}
const showForm = ref(false)
const isLoading = ref(false)
const router = useRouter()

// Etat des notifications
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// variable qui contient les données a afficher de la notification
const showNotification = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const secretaryNavItems = [
  { name: 'Home', path: '/SHome', icon: 'Home' },
  { name: 'Planning', path: '/SPlanning', icon: 'Calendar' },
  { name: 'Bills', path: '/bills', icon: 'Receipt' },
  { name: 'Patients', path: '/patients', icon: 'Users' },
  { name: 'Users', path: '/users', icon: 'UserCog' },
]

const formFields: FormField[] = [
  {
    name: 'clientName',
    label: 'Patient Name',
    type: 'text',
    placeholder: 'Enter the name of the patient ',
  },
  {
    name: 'clientMail',
    label: 'Patient E-mail',
    type: 'email',
    placeholder: 'Enter the e-mail address',
  },
  {
    name: 'clientPhone',
    label: 'Patient Phone',
    type: 'text',
    placeholder: 'Enter the phone number',
  },
  {
    name: 'clientAddress',
    label: 'Patient Address',
    type: 'text',
    placeholder: 'Enter the address',
  }
]

const clients = ref<TableItem[]>([])
const originalClients = ref<TableItem[]>([])

const fetchClients = async () => {
  try {
    const response = await fetch('/api/client/get-clients')
    if (!response.ok) {
      throw new Error('Network response was not ok on fetching clients')
    }
    const data = await response.json()
    clients.value = data as TableItem[]
    originalClients.value = JSON.parse(JSON.stringify(data)) as TableItem[]
    console.log(clients.value)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const handleDelete = async (idClient: number) => {
  const confirmed = confirm('Are you sure that you want to delete this client?')
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/api/client/delete-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idClient }),
    })

    if (!response.ok) {
      showNotification('Failed to delete client', 'error')
      throw new Error('Failed to delete client')
    }

    await fetchClients()
    showNotification('Client deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting client:', error)
    showNotification('Error occurred while deleting client', 'error')
  }
}

const handleUpdate = async (item: TableItem) => {
  try {
    const updatedClient: Client = {
      idClient: item.idClient as number,
      clientName: item.clientName as string,
      clientPhone: item.clientPhone as string,
      clientMail: item.clientMail as string,
      clientAddress: item.clientAddress as string
    }

    const response = await fetch('/api/client/update-client', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedClient),
    })

    if (!response.ok) {
      showNotification('Failed to update client', 'error')
      throw new Error('Failed to update client')
    }

    await fetchClients()
    showNotification('Client updated successfully', 'success')
  } catch (error) {
    console.error('Error updating client:', error)
    showNotification('Error occurred while updating client', 'error')
  }
}

const handleCancel = () => {
  clients.value = JSON.parse(JSON.stringify(originalClients.value))
}

const handleSubmit = async (formData: CreateUserFormData) => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const response = await fetch('/api/client/create-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientName: formData.clientName,
        clientMail: formData.clientMail,
        clientPhone: formData.clientPhone,
        clientAddress: formData.clientAddress,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Server error:', errorData)
      showNotification(errorData.message || 'Failed to create user', 'error')
      return
    }

    showNotification('User successfully created!', 'success')

    showForm.value = false

    await fetchClients()

  } catch (error) {
    console.error('Error creating user:', error)
    showNotification('An error occurred while creating the user', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleForm = () => {
  showForm.value = !showForm.value
}

onMounted(fetchClients)
</script>

<template>
  <div class="relative flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <NavBar :navItems="secretaryNavItems" />

    <main class="flex-1 p-8 overflow-auto">
      <ToastNotification
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />

      <div class="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40">
        <div class="flex items-center gap-4 mb-8">
          <h1 class="text-3xl md:text-4xl font-medium text-sky-900">Patient Management</h1>
        </div>

        <div class="mb-12 flex flex-col items-center">
          <button
            @click="toggleForm"
            class="bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 text-lg font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3 hover:scale-105"
          >
            <span>Create New Patient</span>
          </button>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-medium text-sky-900 mb-4">Patient List</h2>
          <DataTable
            :headers="[
              { actual: 'idClient', display: 'ID' },
              { actual: 'clientName', display: 'Name' },
              { actual: 'clientPhone', display: 'Phone' },
              { actual: 'clientMail', display: 'Email' },
              { actual: 'clientAddress', display: 'Address' },
            ]"
            :items="clients"
            rowKey="idClient"
            @delete="handleDelete"
            @update="handleUpdate"
            @cancel="handleCancel"
          />
        </div>
      </div>

      <!-- Modal Overlay -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showForm"
          class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          @click="showForm = false"
        />
      </transition>

      <!-- Modal Content -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showForm"
          class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-50"
          @click.stop
        >
          <div class="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl md:text-3xl font-medium text-sky-900">Create New Patient</h2>
              <button
                @click="showForm = false"
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

            <DynamicForm
              :fields="formFields"
              submitLabel="Create Patient"
              @submit="handleSubmit"
              @validation-error="showNotification('Please fill in all required fields correctly.', 'error')"
              :isLoading="isLoading"
            >
              <template #buttons="{ isSubmitting }">
                <div class="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    @click="showForm = false"
                    class="px-4 py-2 bg-sky-900/10 hover:bg-sky-900/20 text-sky-900 rounded-lg transition-colors"
                    :disabled="isSubmitting"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 rounded-lg transition-colors flex items-center gap-2"
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting">Creating...</span>
                    <span v-else>Create Patient</span>
                  </button>
                </div>
              </template>
            </DynamicForm>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(186, 230, 253, 0.4) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(186, 230, 253, 0.4);
  border-radius: 20px;
  border: transparent;
}
</style>
