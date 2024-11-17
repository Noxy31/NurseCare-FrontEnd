<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { PropType } from 'vue'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'toggle' | 'date' | 'time' | 'select' | 'number'
  placeholder?: string
  default?: string | boolean | number
  options?:
    | { label: string; value: string | number }[]
    | (() => { label: string; value: string | number }[])
  suggestions?: { label: string; value: string | number }[]
  toggleLabel?: [string, string]
  required?: boolean
}

const props = defineProps({
  fields: {
    type: Array as PropType<FormField[]>,
    required: true,
  },
  submitLabel: {
    type: String,
    default: 'Submit',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// Permet d'envoyer les données de validation au parent
const emit = defineEmits(['submit', 'client-change', 'input', 'validation-error'])

// Prend en charge la gestion du toggle
const formData = reactive(
  props.fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'toggle' ? false : field.default || ''
    return acc
  }, {} as Record<string, string | boolean | number>)
)


//Méthode pour mettre a jour un champ via un event
const updateField = (fieldName: string, value: any) => {
  if (fieldName in formData) {
    formData[fieldName] = value
  }
}

// Ajout du reactive pour les valeurs d'affichage
const displayValues = reactive<Record<string, string>>(
  props.fields.reduce((acc, field) => {
    if (field.suggestions) {
      acc[field.name] = ''
    }
    return acc
  }, {} as Record<string, string>)
)

// Méthode pour suggérer des données dans les champs de suggestions
const filteredSuggestions = ref<Record<string, { label: string; value: string | number }[]>>({})

const filterSuggestions = (field: FormField) => {
  if (!field.suggestions || !Array.isArray(field.suggestions)) {
    filteredSuggestions.value[field.name] = []
    return
  }

  const inputValue = displayValues[field.name]

  if (!inputValue) {
    filteredSuggestions.value[field.name] = []
    return
  }

  const query = inputValue.toLowerCase()

  if (query) {
    filteredSuggestions.value[field.name] = field.suggestions.filter((suggestion) =>
      suggestion.label.toLowerCase().includes(query)
    )
  } else {
    filteredSuggestions.value[field.name] = []
  }
}

// Gestion de la sélection des suggestions
const selectSuggestion = (
  suggestion: { label: string; value: string | number },
  fieldName: string
) => {
  if (fieldName in formData) {
    formData[fieldName] = suggestion.value
    displayValues[fieldName] = suggestion.label
    emit('client-change', suggestion.value)
  }
  filteredSuggestions.value[fieldName] = []
}

// Manage l'envoie des données du formulaire
const submitForm = () => {
  if (props.isLoading) return
  // Verification de la validité des données et formatage
  const isValid = Object.values(formData).every((value) => {
    if (typeof value === 'boolean') return true
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return !isNaN(value) && value > 0
    return false
  })

  if (isValid) {
    emit('submit', formData)
  } else {
    emit('validation-error')
  }
}

const getOptions = (options: FormField['options']) => {
  return typeof options === 'function' ? options() : options || []
}

defineExpose({
  updateField,
})
</script>

<template>
  <div
    class="bg-sky-900/20 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-sky-700/20"
  >
    <form @submit.prevent="submitForm" class="space-y-6 w-full">
      <div v-for="field in fields" :key="field.name" class="form-group relative">
        <label :for="field.name" class="block text-sky-900 text-sm font-medium mb-1">
          {{ field.label }}
          <span v-if="field.required" class="text-red-400">*</span>
        </label>

        <select
          v-if="field.type === 'select'"
          :name="field.name"
          v-model="formData[field.name]"
          class="mt-1 block w-full p-2.5 rounded-lg border border-sky-700/30 bg-sky-900/10 backdrop-blur-sm text-sky-900 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors placeholder-slate-600"
        >
          <option disabled value="">{{ field.placeholder }}</option>
          <option
            v-for="option in getOptions(field.options)"
            :key="option.value"
            :value="option.value"
            class="bg-white text-sky-900"
          >
            {{ option.label }}
          </option>
        </select>

        <div v-else-if="field.suggestions" class="relative">
          <input
            :type="field.type"
            :name="field.name"
            v-model="displayValues[field.name]"
            :placeholder="field.placeholder"
            @input="() => filterSuggestions(field)"
            class="mt-1 block w-full p-2.5 rounded-lg border border-sky-700/30 bg-sky-900/10 backdrop-blur-sm text-sky-900 placeholder-slate-600 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
          />
          <ul
            v-if="filteredSuggestions[field.name]?.length"
            class="absolute z-10 bg-white border border-sky-700/30 rounded-lg w-full mt-1 shadow-lg"
          >
            <li
              v-for="suggestion in filteredSuggestions[field.name]"
              :key="suggestion.value"
              @click="selectSuggestion(suggestion, field.name)"
              class="cursor-pointer text-sky-900 p-2.5 first:rounded-t-lg last:rounded-b-lg hover:bg-sky-50 transition-colors"
            >
              {{ suggestion.label }}
            </li>
          </ul>
        </div>

        <div v-else-if="field.type === 'toggle'" class="mt-3 flex items-center space-x-3">
          <label :for="field.name" class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              :id="field.name"
              v-model="formData[field.name]"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-sky-900/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-600/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-sky-700/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-700/40"
            ></div>
            <span class="ml-3 text-sm font-medium text-sky-900">
              {{ formData[field.name] ? field.toggleLabel?.[0] : field.toggleLabel?.[1] }}
            </span>
          </label>
        </div>

        <input
          v-else
          :type="field.type"
          :name="field.name"
          v-model="formData[field.name]"
          :placeholder="field.placeholder"
          :required="field.required"
          :min="field.type === 'time' ? '00:00' : undefined"
          :max="field.type === 'time' ? '23:59' : undefined"
          class="mt-1 block w-full p-2.5 rounded-lg border border-sky-700/30 bg-sky-900/10 backdrop-blur-sm text-sky-900 placeholder-slate-500 focus:outline-none focus:border-sky-600/60 focus:ring-2 focus:ring-sky-600/20 transition-colors"
        />

        <div v-if="field.required && !formData[field.name]" class="text-red-400 text-sm mt-1">
          {{ field.label }} is required.
        </div>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full p-3 rounded-lg bg-sky-700/40 hover:bg-sky-700/60 text-sky-900 font-medium transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">{{ submitLabel }}</span>
        <div v-else class="flex items-center justify-center gap-2">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      </button>
    </form>
  </div>
</template>
