<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '../DataTab.vue'
import NavBar from '@/components/NavBar.vue'
import type { TableItem } from '../DataTab.vue'
import DynamicForm from '../DynamicForm.vue'
import type { FormField } from '../DynamicForm.vue'
import ToastNotification from '../ToastNotification.vue'

interface Trainee {
  idTrainee: number
  traineeName: string
  traineeFirstName: string
  traineeSchool: string
  traineeAvgGrade: number
}

interface CreateTraineeFormData {
  traineeName: string
  traineeFirstName: string
  traineeSchool: string
  traineeAvgGrade: number
}

const managerNavItems = [
  { name: 'Overview', path: '/MHome', icon: 'Home' },
  { name: 'Agenda', path: '/MAgenda', icon: 'Calendar' },
  { name: 'Users', path: '/MUsers', icon: 'UserCog' },
  { name: 'Trainee', path: '/MTrainee', icon: 'UserPen' },
]

const showForm = ref(false)
const isLoading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showNotification = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

const formFields: FormField[] = [
  {
    name: 'traineeName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter the trainee last name',
  },
  {
    name: 'traineeFirstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter the trainee first name',
  },
  {
    name: 'traineeSchool',
    label: 'School',
    type: 'text',
    placeholder: 'Enter the school name',
  },
]

const trainees = ref<TableItem[]>([])
const originalTrainees = ref<TableItem[]>([])

const fetchTrainees = async () => {
  try {
    const response = await fetch('/api/trainee/get-trainees')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    trainees.value = data as TableItem[]
    originalTrainees.value = JSON.parse(JSON.stringify(data)) as TableItem[]
    console.log(trainees.value)
  } catch (error) {
    console.error('Error fetching trainees:', error)
  }
}

const handleDelete = async (idTrainee: number) => {
  const confirmed = confirm('Are you sure that you want to delete this trainee?')
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/api/trainee/delete-trainee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idTrainee }),
    })

    if (!response.ok) {
      showNotification('Failed to delete trainee', 'error')
      throw new Error('Failed to delete trainee')
    }

    await fetchTrainees()
    showNotification('Trainee deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting trainee:', error)
    showNotification('Error occurred while deleting trainee', 'error')
  }
}

const handleUpdate = async (item: TableItem) => {
  try {
    const updatedTrainee: Trainee = {
      idTrainee: item.idTrainee as number,
      traineeName: item.traineeName as string,
      traineeFirstName: item.traineeFirstName as string,
      traineeSchool: item.traineeSchool as string,
      traineeAvgGrade: item.traineeAvgGrade as number,
    }

    const response = await fetch('/api/trainee/update-trainee', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTrainee),
    })

    if (!response.ok) {
      showNotification('Failed to update trainee', 'error')
      throw new Error('Failed to update trainee')
    }

    await fetchTrainees()
    showNotification('Trainee updated successfully', 'success')
  } catch (error) {
    console.error('Error updating trainee:', error)
    showNotification('Error occurred while updating trainee', 'error')
  }
}

const handleCancel = () => {
  trainees.value = JSON.parse(JSON.stringify(originalTrainees.value))
}

const handleSubmit = async (formData: CreateTraineeFormData) => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    const response = await fetch('/api/trainee/create-trainee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create trainee')
    }

    await fetchTrainees()
    showNotification('Trainee successfully created!', 'success')
    showForm.value = false
  } catch (error) {
    console.error('Error creating trainee:', error)
    showNotification(
      error instanceof Error ? error.message : 'An error occurred while creating the trainee',
      'error'
    )
  } finally {
    isLoading.value = false
  }
}

const toggleForm = () => {
  showForm.value = !showForm.value
}

onMounted(fetchTrainees)
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
        <div class="flex items-center gap-4 mb-8">
          <h1 class="text-3xl md:text-4xl font-medium text-sky-900">Trainee Management</h1>
        </div>

        <div class="mb-12 flex flex-col items-center">
          <button
            @click="toggleForm"
            class="bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 text-lg font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3 hover:scale-105"
          >
            <span>Create New Trainee</span>
          </button>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-medium text-sky-900 mb-4">Trainee List</h2>
          <div class="overflow-x-auto min-w-0">
            <DataTable
              :headers="[
                { actual: 'idTrainee', display: 'ID' },
                { actual: 'traineeName', display: 'Last Name' },
                { actual: 'traineeFirstName', display: 'First Name' },
                { actual: 'traineeSchool', display: 'School' },
                { actual: 'traineeAvgGrade', display: 'Average Grade' },
              ]"
              :items="trainees"
              rowKey="idTrainee"
              :read-only="false"
              :editableFields="['traineeName', 'traineeFirstName', 'traineeSchool']"
              @delete="handleDelete"
              @update="handleUpdate"
              @cancel="handleCancel"
              class="w-full"
            />
          </div>
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
          <div
            class="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4"
          >
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium text-sky-900">
                Create New Trainee
              </h2>
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
              submitLabel="Create Trainee"
              @submit="handleSubmit"
              @validation-error="
                showNotification('Please fill in all required fields correctly.', 'error')
              "
              :isLoading="isLoading"
            >
              <template #buttons="{ isSubmitting }">
                <div class="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    @click="showForm = false"
                    class="px-4 py-2 bg-sky-900/10 hover:bg-sky-900/20 text-sky-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isLoading"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading">Creating...</span>
                    <span v-else>Create Trainee</span>
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
