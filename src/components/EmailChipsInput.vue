<script setup lang="ts">
import { ref, computed } from 'vue'

type Member = { id?: string; email: string; name?: string }
type Suggestion = { email: string; name?: string }

const props = defineProps<{
  members: Member[]
  label: string
  inputId?: string
  placeholder?: string
  suggestions?: Suggestion[]
}>()

const emit = defineEmits<{
  add: [email: string]
  remove: [member: Member]
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref('')
const highlightedIndex = ref(-1)

const filteredSuggestions = computed(() => {
  if (!props.suggestions || !inputValue.value.trim()) return []
  const query = inputValue.value.trim().toLowerCase()
  const existingEmails = new Set(props.members.map(m => m.email.toLowerCase()))
  return props.suggestions
    .filter(s => {
      if (existingEmails.has(s.email.toLowerCase())) return false
      return s.email.toLowerCase().includes(query) || s.name?.toLowerCase().includes(query)
    })
    .slice(0, 8)
})

function handleEnter() {
  if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
    selectSuggestion(filteredSuggestions.value[highlightedIndex.value])
    return
  }
  const email = inputValue.value.trim()
  if (email) {
    emit('add', email)
    inputValue.value = ''
    highlightedIndex.value = -1
  }
}

function handleArrowDown() {
  if (filteredSuggestions.value.length === 0) return
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredSuggestions.value.length - 1)
}

function handleArrowUp() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
}

function handleEscape() {
  highlightedIndex.value = -1
  inputValue.value = ''
}

function handleInput() {
  highlightedIndex.value = -1
}

function selectSuggestion(s: Suggestion) {
  emit('add', s.email)
  inputValue.value = ''
  highlightedIndex.value = -1
  inputRef.value?.focus()
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') ?? ''
  const emails = text.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
  for (const email of emails) {
    emit('add', email)
  }
  inputValue.value = ''
}
</script>

<template>
  <div class="relative">
    <label :for="inputId" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
      {{ label }}
    </label>
    <div class="flex flex-wrap items-center gap-1.5 min-h-[2.375rem] px-2 py-1.5 rounded-md bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-indigo-600 cursor-text"
         @click="inputRef?.focus()">
      <span v-for="member in members" :key="member.id ?? member.email"
            class="inline-flex items-center gap-x-0.5 rounded-md bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30 shrink-0">
        {{ member.email }}
        <button @click.stop="emit('remove', member)" type="button"
                class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-indigo-600/20 dark:hover:bg-indigo-400/20">
          <span class="sr-only">Remove</span>
          <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-indigo-700/50 dark:stroke-indigo-300/70 group-hover:stroke-indigo-700 dark:group-hover:stroke-indigo-200">
            <path d="M4 4l6 6m0-6l-6 6" />
          </svg>
          <span class="absolute -inset-1" />
        </button>
      </span>
      <input ref="inputRef"
             :id="inputId"
             v-model="inputValue"
             @keydown.enter.prevent="handleEnter"
             @keydown.down.prevent="handleArrowDown"
             @keydown.up.prevent="handleArrowUp"
             @keydown.esc="handleEscape"
             @input="handleInput"
             @paste="handlePaste"
             :placeholder="members.length === 0 ? (placeholder ?? 'Enter email and press Enter') : ''"
             class="flex-1 min-w-40 border-0 bg-transparent py-0 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-0"
      />
    </div>
    <ul v-if="filteredSuggestions.length > 0"
        class="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 text-sm">
      <li v-for="(s, i) in filteredSuggestions" :key="s.email"
          @mousedown.prevent="selectSuggestion(s)"
          :class="['flex cursor-pointer items-center justify-between px-3 py-2',
                   i === highlightedIndex
                     ? 'bg-indigo-600 text-white'
                     : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700']">
        <span>{{ s.email }}</span>
        <span v-if="s.name"
              :class="['ml-2 text-xs', i === highlightedIndex ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500']">
          {{ s.name }}
        </span>
      </li>
    </ul>
  </div>
</template>
