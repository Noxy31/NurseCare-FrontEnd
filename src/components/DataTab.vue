<script setup lang="ts">
import { ref, computed } from 'vue'

export interface TableItem {
  [key: string]: string | number | boolean | undefined
  isNew?: boolean
  isEditing?: boolean
}

interface ValueMapping {
  field: string
  values: Record<string | number, string>
}

interface HeaderMapping {
  actual: string
  display: string
}

const props = withDefaults(
  defineProps<{
    headers: HeaderMapping[]
    items: TableItem[]
    rowKey: string
    isClickable?: boolean
    isCheckable?: boolean
    selectedOrders?: number[]
    valueMappings?: ValueMapping[]
    readOnly?: boolean
    editableFields?: string[]
  }>(),
  {
    isClickable: false,
    isCheckable: false,
    selectedOrders: () => [],
    valueMappings: () => [],
    readOnly: true,
    editableFields: () => [],
  }
)

const emit = defineEmits<{
  (e: 'edit', item: TableItem): void
  (e: 'delete', id: number): void
  (e: 'update', item: TableItem): void
  (e: 'cancel', item: TableItem): void
  (e: 'row-click', item: TableItem): void
  (e: 'selectionChanged', id: number, checked: boolean): void
}>()

const searchQuery = ref<string>('')
const currentPage = ref(1)
const itemsPerPage = 10

// Tri par défaut des éléments par ID
const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => {
    const aValue = a[props.rowKey]
    const bValue = b[props.rowKey]
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue
    }
    return 0
  })
})

// Filtrage des éléments
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return sortedItems.value
  }

  return sortedItems.value.filter((item) => {
    return Object.values(item).some((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchQuery.value.toLowerCase())
      }
      return false
    })
  })
})

// Pagination des éléments
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.value.slice(start, end)
})

// Nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage)
})

// Navigation entre les pages
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

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

const formatValue = (value: any, header: string) => {
  const mapping = props.valueMappings?.find((m) => m.field === header)
  if (mapping && mapping.values[value] !== undefined) {
    return mapping.values[value]
  }
  return value
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
  <div
    class="bg-sky-900/20 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-sky-700/20"
  >
    <div class="flex justify-end mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search"
        class="p-2 border border-sky-700/30 rounded-lg w-1/2 md:w-1/4 bg-sky-900/10 backdrop-blur-sm text-sky-900 placeholder-slate-500 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
      />
    </div>

    <div class="overflow-x-auto md:overflow-hidden">
      <table class="min-w-full divide-y divide-sky-700/20 text-xs md:text-sm">
        <thead class="bg-sky-900/30 text-sky-900">
          <tr>
            <th v-if="isCheckable" class="px-2 py-2 md:px-3 text-center w-10">
              <input type="checkbox" class="rounded border-sky-700/40" />
            </th>
            <th
              v-for="header in headers"
              :key="header.actual"
              class="px-2 py-2 md:px-3 text-center text-xs md:text-sm font-semibold uppercase tracking-wider"
            >
              {{ header.display }}
            </th>
            <th class="px-2 py-2 md:px-3 w-32 md:w-40 shrink-0"></th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" class="divide-y divide-sky-700/20" name="list" appear>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="item[rowKey]?.toString() || index"
            @click="handleRowClick(item)"
            :class="{
              'cursor-pointer': isClickable && !item.isEditing,
              'cursor-default': !isClickable || item.isEditing,
              'hover:bg-sky-800/20': isClickable && !item.isEditing,
              'transition-all duration-300': true,
              'bg-sky-900/10': index % 2 === 0 && !item.isEditing && !item.isNew,
              'bg-sky-900/5': index % 2 === 1 && !item.isEditing && !item.isNew,
              'highlight-new': item.isNew,
              'editing-row': item.isEditing,
            }"
          >
            <td v-if="isCheckable" class="px-2 py-2 md:px-3 text-center w-10">
              <input
                type="checkbox"
                :checked="isSelected(item)"
                @change="handleCheck(item, $event)"
                class="rounded border-sky-700/40"
              />
            </td>
            <td
              v-for="header in headers"
              :key="header.actual"
              class="px-2 py-2 md:px-3 text-center text-sky-900"
            >
              <Transition name="fade" mode="out-in">
                <template v-if="item.isEditing">
                  <div class="max-w-full overflow-hidden">
                    <input
                      v-if="
                        !readOnly &&
                        (!editableFields.length || editableFields.includes(header.actual))
                      "
                      v-model="item[header.actual]"
                      class="w-full p-1 md:p-2 border border-sky-700/30 rounded-lg bg-sky-100/20 text-sky-900 text-xs md:text-sm focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-all duration-300"
                    />
                    <div
                      v-else
                      class="whitespace-normal break-words min-w-[120px] max-w-[200px] mx-auto h-auto"
                    >
                      {{ formatValue(item[header.actual], header.actual) }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="whitespace-normal break-words min-w-[120px] max-w-[200px] mx-auto h-auto"
                  >
                    {{ formatValue(item[header.actual], header.actual) }}
                  </div>
                </template>
              </Transition>
            </td>

            <td class="px-2 py-2 md:px-3 text-center w-32 md:w-40 shrink-0">
              <div class="flex justify-center items-center gap-1 md:gap-2">
                <Transition name="fade" mode="out-in">
                  <template v-if="item.isEditing">
                    <div class="flex gap-1 md:gap-2">
                      <button
                        @click="saveEdit(item, $event)"
                        class="bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-900 font-medium py-1 px-2 md:py-2 md:px-3 rounded-lg transition-colors duration-200 text-xs md:text-sm shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        Validate
                      </button>
                      <button
                        @click="cancelEdit(item, $event)"
                        class="bg-sky-800/40 hover:bg-sky-800/60 text-sky-900 font-medium py-1 px-2 md:py-2 md:px-3 rounded-lg transition-colors duration-200 text-xs md:text-sm shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        Cancel
                      </button>
                    </div>
                  </template>
                  <template v-else>
                    <template v-if="isCheckable">
                      <span class="text-sky-900 text-xs md:text-sm">Select</span>
                    </template>
                    <template v-else-if="!readOnly">
                      <div class="flex gap-1 md:gap-2">
                        <button
                          @click="startEdit(item, $event)"
                          class="bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium py-1 px-2 md:py-2 md:px-3 rounded-lg transition-colors duration-200 text-xs md:text-sm shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          @click="deleteItem(item, $event)"
                          class="bg-red-900/50 hover:bg-red-900/70 text-sky-900 font-medium py-1 px-2 md:py-2 md:px-3 rounded-lg transition-colors duration-200 text-xs md:text-sm shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </template>
                  </template>
                </Transition>
              </div>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-sky-900">
        Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} of {{ filteredItems.length }} entries
      </div>
      <div class="flex gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-lg bg-sky-700/40 text-sky-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700/60 transition-colors"
        >
          ←
        </button>
        <span
          class="px-3 py-1 rounded-lg bg-sky-700/60 text-white"
        >
          {{ currentPage }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-lg bg-sky-700/40 text-sky-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700/60 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.editing-input {
  @apply bg-sky-900/10 backdrop-blur-sm;
  animation: fadeBackground 0.3s ease-out;
}

@keyframes fadeBackground {
  from {
    background-color: transparent;
    backdrop-filter: blur(0);
  }
  to {
    background-color: rgba(3, 105, 161, 0.1);
    backdrop-filter: blur(4px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.highlight-new {
  animation: highlightNew 2s ease-out;
}

@keyframes highlightNew {
  0% {
    background-color: rgba(14, 165, 233, 0.2);
    transform: translateY(-30px);
  }
  50% {
    background-color: rgba(14, 165, 233, 0.2);
  }
  100% {
    background-color: transparent;
    transform: translateY(0);
  }
}

.editing-row {
  background-color: rgba(14, 165, 233, 0.1) !important;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.3);
}
</style>
