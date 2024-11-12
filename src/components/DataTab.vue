<script setup lang="ts">
import { ref, computed } from 'vue'

export interface TableItem {
  [key: string]: string | number | boolean | undefined
}

const props = withDefaults(defineProps<{
  headers: string[]
  items: TableItem[]
  rowKey: string
  isClickable?: boolean
  isCheckable?: boolean
  selectedOrders?: number[]
}>(), {
  isClickable: false,
  isCheckable: false,
  selectedOrders: () => []
})

const emit = defineEmits<{
  (e: 'edit', item: TableItem): void
  (e: 'delete', id: number): void
  (e: 'update', item: TableItem): void
  (e: 'cancel', item: TableItem): void
  (e: 'row-click', item: TableItem): void
  (e: 'selectionChanged', id: number, checked: boolean): void
}>()

const searchQuery = ref<string>('')

const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return props.items
  }

  return props.items.filter(item => {
    return Object.values(item).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.value.toLowerCase())
      }
      return false
    })
  })
})

const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

const handleCheck = (item: TableItem, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  const id = item[props.rowKey]

  if (isValidNumber(id)) {
    console.log('Checkbox changed for ID:', id, 'Checked:', checked)
    emit('selectionChanged', id, checked)
  } else {
    console.error('Invalid ID value:', id)
  }
}

const isSelected = (item: TableItem): boolean => {
  const id = item[props.rowKey]
  return isValidNumber(id) && (props.selectedOrders?.includes(id) ?? false)
}

const handleRowClick = (item: TableItem) => {
  if (props.isClickable && !item.isEditing) {
    const id = item[props.rowKey]
    if (isValidNumber(id)) {
      emit('row-click', item)
    }
  }
}

const startEdit = (item: TableItem, event: MouseEvent) => {
  event.stopPropagation()
  item.isEditing = true
  emit('edit', { ...item })
}

const saveEdit = (item: TableItem, event: MouseEvent) => {
  event.stopPropagation()
  item.isEditing = false
  emit('update', item)
}

const cancelEdit = (item: TableItem, event: MouseEvent) => {
  event.stopPropagation()
  item.isEditing = false
  emit('cancel', item)
}

const deleteItem = (item: TableItem, event: MouseEvent) => {
  event.stopPropagation()
  const id = item[props.rowKey]
  if (isValidNumber(id)) {
    emit('delete', id)
  }
}
</script>

<template>
  <div class="bg-gradient p-3 md:p-4 rounded-lg shadow-md w-full">
    <div class="flex justify-end mb-3 md:mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search"
        class="p-1 border border-gray-300 rounded w-1/2 md:w-1/4 h-8"
      />
    </div>
    <div class="overflow-x-auto md:overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 text-sm md:text-base">
        <thead class="bg-gray-800 text-white">
          <tr>
            <th v-if="isCheckable" class="px-2 py-2 md:px-4 text-center">
              <input type="checkbox" />
            </th>
            <th
              v-for="(header, index) in headers"
              :key="index"
              class="px-2 py-2 md:px-4 text-center text-xs md:text-sm font-medium uppercase tracking-wider"
            >
              {{ header }}
            </th>
            <th class="px-2 py-2 md:px-4"></th>
          </tr>
        </thead>
        <tbody class="bg-gray-100 divide-y divide-gray-200">
          <tr
            v-for="(item, index) in filteredItems"
            :key="item[rowKey]?.toString() || index"
            @click="handleRowClick(item)"
            :class="{
              'cursor-pointer': isClickable && !item.isEditing,
              'cursor-default': !isClickable || item.isEditing,
              'hover:bg-gray-300': isClickable && !item.isEditing,
            }"
          >
            <td v-if="isCheckable" class="px-2 py-1 md:px-4 text-center">
              <input
                type="checkbox"
                :checked="isSelected(item)"
                @change="handleCheck(item, $event)"
              />
            </td>
            <td
              v-for="header in headers"
              :key="header"
              class="px-2 py-1 md:px-4 text-center"
            >
              <template v-if="item.isEditing">
                <input
                  v-model="item[header]"
                  class="border border-gray-300 p-1 rounded w-full md:w-auto"
                />
              </template>
              <template v-else>
                <div class="truncate max-w-[100px] md:max-w-full relative">
                  {{ item[header] }}
                </div>
              </template>
            </td>
            <td class="px-2 py-1 md:px-4 whitespace-nowrap text-center">
              <template v-if="item.isEditing">
                <button
                  @click="saveEdit(item, $event)"
                  class="bg-green-400 hover:bg-green-500 text-white font-semibold py-1 px-2 rounded text-xs md:text-sm"
                >
                  Validate
                </button>
                <button
                  @click="cancelEdit(item, $event)"
                  class="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-1 px-2 rounded ml-2 text-xs md:text-sm"
                >
                  Cancel
                </button>
              </template>
              <template v-else>
                <template v-if="isCheckable">
                  <span class="text-gray-500">Select</span>
                </template>
                <template v-else>
                  <button
                    @click="startEdit(item, $event)"
                    class="bg-indigo-400 hover:bg-indigo-500 text-white font-semibold py-1 px-2 rounded text-xs md:text-sm"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteItem(item, $event)"
                    class="bg-red-400 hover:bg-red-500 text-white font-semibold py-1 px-2 rounded ml-2 md:ml-4 text-xs md:text-sm"
                  >
                    Delete
                  </button>
                </template>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient {
  background: linear-gradient(145deg, #1f2937, #374151);
}
.cursor-pointer {
  cursor: pointer;
}
.cursor-default {
  cursor: default;
}
.hover\:bg-gray-300:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
