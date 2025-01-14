<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '../DataTab.vue'
import NavBar from '@/components/NavBar.vue'
import type { TableItem } from '../DataTab.vue'
import DynamicForm from '../DynamicForm.vue'
import type { FormField } from '../DynamicForm.vue'
import ToastNotification from '../ToastNotification.vue'
import { useRouter } from 'vue-router'

interface User {
  idUser: number
  userName: string
  userMail: string
  userRole: string
}

interface CreateUserFormData {
  userName: string
  userMail: string
  userPass: string
  confirmPassword: string
  userRole: boolean
}

const secretaryNavItems = [
  { name: 'Home', path: '/SHome', icon: 'Home' },
  { name: 'Planning', path: '/SPlanning', icon: 'Calendar' },
  { name: 'Bills', path: '/bills', icon: 'Receipt' },
  { name: 'Patients', path: '/patients', icon: 'Users' },
  { name: 'Users', path: '/users', icon: 'UserCog' },
]

const showForm = ref(false)
const isLoading = ref(false)
const router = useRouter()
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
    name: 'userName',
    label: 'User Name',
    type: 'text',
    placeholder: 'Enter the name of the user',
  },
  {
    name: 'userMail',
    label: 'E-mail',
    type: 'email',
    placeholder: 'Enter the e-mail address',
  },
  {
    name: 'userPass',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter the password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm the password',
  },
  {
    name: 'userRole',
    label: 'User Role',
    type: 'select',
    placeholder: 'Select a role',
    options: [
      { label: 'Manager', value: 'manager' },
      { label: 'Secretary', value: 'secretary' },
      { label: 'Nurse', value: 'nurse' },
    ],
  },
]

const users = ref<TableItem[]>([])
const originalUsers = ref<TableItem[]>([])

const fetchUsers = async () => {
  try {
    const response = await fetch('/api/users/get-users')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    users.value = data as TableItem[]
    originalUsers.value = JSON.parse(JSON.stringify(data)) as TableItem[]
    console.log(users.value)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const handleDelete = async (idUser: number) => {
  const confirmed = confirm('Are you sure that you want to delete this user?')
  if (!confirmed) {
    return
  }

  try {
    const response = await fetch('/api/users/delete-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idUser }),
    })

    if (!response.ok) {
      showNotification('Failed to delete user', 'error')
      throw new Error('Failed to delete user')
    }

    await fetchUsers()
    showNotification('User deleted successfully', 'success')
  } catch (error) {
    console.error('Error deleting user:', error)
    showNotification('Error occurred while deleting user', 'error')
  }
}

const handleUpdate = async (item: TableItem) => {
  try {
    const updatedUser: User = {
      idUser: item.idUser as number,
      userName: item.userName as string,
      userMail: item.userMail as string,
      userRole: item.userRole as string,
    }

    const response = await fetch('/api/users/update-user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser),
    })

    if (!response.ok) {
      showNotification('Failed to update user', 'error')
      throw new Error('Failed to update user')
    }

    await fetchUsers()
    showNotification('User updated successfully', 'success')
  } catch (error) {
    console.error('Error updating user:', error)
    showNotification('Error occurred while updating user', 'error')
  }
}

const handleCancel = () => {
  users.value = JSON.parse(JSON.stringify(originalUsers.value))
}

const handleSubmit = async (formData: CreateUserFormData) => {
  if (isLoading.value) return
  isLoading.value = true

  if (formData.userPass !== formData.confirmPassword) {
    showNotification("Passwords don't match", 'error')
    isLoading.value = false
    return
  }

  try {
    const response = await fetch('/api/users/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: formData.userName,
        userMail: formData.userMail,
        userPass: formData.userPass,
        userRole: formData.userRole,
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
    await fetchUsers()

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

onMounted(fetchUsers)
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
        <div class="flex items-center gap-4 mb-8">
          <h1 class="text-3xl md:text-4xl font-medium text-sky-900">User Management</h1>
        </div>

        <div class="mb-12 flex flex-col items-center">
          <button
            @click="toggleForm"
            class="bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 text-lg font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3 hover:scale-105"
          >
            <span>Create New User</span>
          </button>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-medium text-sky-900 mb-4">User List</h2>
          <div class="overflow-x-auto min-w-0">
            <DataTable
              :headers="[
                { actual: 'idUser', display: 'ID' },
                { actual: 'userName', display: 'Name' },
                { actual: 'userMail', display: 'Email' },
                { actual: 'userRole', display: 'Role' },
              ]"
              :items="users"
              rowKey="idUser"
              :valueMappings="[
                {
                  field: 'userRole',
                  values: {
                    'manager': 'Manager',
                    'secretary': 'Secretary',
                    'nurse': 'Nurse',
                  },
                },
              ]"
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
          <div class="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/40 mx-4">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl sm:text-2xl lg:text-3xl font-medium text-sky-900">Create New User</h2>
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
              submitLabel="Create User"
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
                    <span v-else>Create User</span>
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
