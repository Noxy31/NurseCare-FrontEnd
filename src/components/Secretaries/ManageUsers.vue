<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SideNav from '@/components/Secretaries/SideNavSecretary.vue'
import DataTable from '../DataTab.vue'
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
const showForm = ref(false)
const isLoading = ref(false)
const router = useRouter()

// Etat des notifications
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// variable qui contient les donnés a afficher de la notification
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
      { label: 'Manager', value: 1 },
      { label: 'Secretary', value: 2 },
      { label: 'Nurse', value: 3 },
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

    setTimeout(() => {
      router.push('/SHome')
    }, 2000)
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
  <div class="relative flex min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-sky-50">
    <SideNav />

    <main class="flex-1 p-8 overflow-auto">
      <ToastNotification
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />

      <div class="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] transition-shadow duration-300 border border-white/40">
        <div class="flex items-center gap-4 mb-8">
          <h1 class="text-3xl md:text-4xl font-medium text-sky-900">User Management</h1>
        </div>

        <div class="mb-12 flex flex-col items-center">
          <button
            @click="toggleForm"
            class="bg-sky-900/20 hover:bg-sky-900/30 text-sky-900 text-lg font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3 hover:scale-105"
          >
            <span v-if="!showForm">Create New User</span>
            <span v-else>Close Form</span>
          </button>

          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="transform -translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-4 opacity-0"
          >
            <div
              v-if="showForm"
              class="mt-6 bg-sky-100/20 backdrop-blur-sm p-6 rounded-lg border border-white/40 mx-auto max-w-xl w-full"
            >
              <h2 class="text-2xl md:text-3xl font-medium text-sky-900 mb-4">Create New User</h2>
              <DynamicForm
                :fields="formFields"
                submitLabel="Create User"
                @submit="handleSubmit"
                @validation-error="
                  showNotification('Please fill in all required fields correctly.', 'error')
                "
                :isLoading="isLoading"
              />
            </div>
          </transition>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-medium text-sky-900 mb-4">User List</h2>
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
                  '1': 'Manager',
                  '2': 'Secretary',
                  '3': 'Nurse',
                },
              },
            ]"
            @delete="handleDelete"
            @update="handleUpdate"
            @cancel="handleCancel"
          />
        </div>
      </div>
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
