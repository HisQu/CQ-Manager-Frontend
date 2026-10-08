<script setup lang="ts">
import {computed, ref, watch} from "vue";
import TagBadge from "./TagBadge.vue";
import TagDataService from "../services/TagDataService.ts";
import {normalizeTagName, TAG_NAME_MAX_LENGTH} from "../utils/tagColors.ts";

// Picks tags of a project for a CQ. Typing a name that does not exist yet offers to create the tag.
const props = defineProps<{
  projectId: string;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  error: [response: UXResponse];
}>();

const selected = defineModel<TagReducedT[]>({ required: true });

type Option = { kind: 'existing'; tag: TagT } | { kind: 'create'; name: string };

const projectTags = ref<TagT[]>([]);
const inputRef = ref<HTMLInputElement>();
const inputValue = ref('');
const focused = ref(false);
const highlightedIndex = ref(0);
const creating = ref(false);

async function fetchTags() {
  if (!props.projectId) return;
  const response = await TagDataService.getAllForProject(props.projectId);
  if ("messageType" in response) {
    emit('error', response);
  } else {
    projectTags.value = response.data;
  }
}

watch(() => props.projectId, fetchTags, { immediate: true });

const options = computed<Option[]>(() => {
  const query = normalizeTagName(inputValue.value);
  const lowerQuery = query.toLowerCase();
  const selectedIds = new Set(selected.value.map(t => t.id));
  const matches: Option[] = projectTags.value
    .filter(t => !selectedIds.has(t.id) && t.name.toLowerCase().includes(lowerQuery))
    .slice(0, 8)
    .map(tag => ({ kind: 'existing', tag }));
  const exists = projectTags.value.some(t => t.name.toLowerCase() === lowerQuery);
  if (query && !exists && query.length <= TAG_NAME_MAX_LENGTH) {
    matches.push({ kind: 'create', name: query });
  }
  return matches;
});

watch(options, () => { highlightedIndex.value = 0; });

function addTag(tag: TagReducedT) {
  if (!selected.value.some(t => t.id === tag.id)) {
    selected.value = [...selected.value, { id: tag.id, name: tag.name }];
  }
  inputValue.value = '';
  inputRef.value?.focus();
}

function removeTag(tag: TagReducedT) {
  selected.value = selected.value.filter(t => t.id !== tag.id);
}

async function createTag(name: string) {
  creating.value = true;
  const response = await TagDataService.add(props.projectId, name);
  creating.value = false;
  if ("messageType" in response) {
    emit('error', response);
    return;
  }
  projectTags.value = [...projectTags.value, response.data];
  addTag(response.data);
}

function choose(option: Option) {
  if (option.kind === 'existing') addTag(option.tag);
  else createTag(option.name);
}

function handleEnter() {
  const option = options.value[highlightedIndex.value];
  if (option && !creating.value) choose(option);
}

function handleBackspace() {
  if (!inputValue.value && selected.value.length) {
    removeTag(selected.value[selected.value.length - 1]);
  }
}
</script>

<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">{{ label }}</label>
    <div :class="['flex flex-wrap items-center gap-1.5 min-h-[2.375rem] px-2 py-1.5 rounded-md bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus-within:ring-2 focus-within:ring-indigo-600',
                  disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text']"
         @click="inputRef?.focus()">
      <TagBadge v-for="tag in selected" :key="tag.id" :name="tag.name" :removable="!disabled" @remove="removeTag(tag)" />
      <input v-if="!disabled"
             ref="inputRef"
             v-model="inputValue"
             :maxlength="TAG_NAME_MAX_LENGTH"
             :placeholder="selected.length === 0 ? 'Add tags…' : ''"
             class="flex-1 min-w-32 border-0 bg-transparent py-0 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-0"
             @focus="focused = true"
             @input="focused = true"
             @blur="focused = false"
             @keydown.enter.prevent="handleEnter"
             @keydown.down.prevent="highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1)"
             @keydown.up.prevent="highlightedIndex = Math.max(highlightedIndex - 1, 0)"
             @keydown.esc="inputValue = ''; inputRef?.blur()"
             @keydown.backspace="handleBackspace" />
      <span v-else-if="selected.length === 0" class="text-sm text-gray-400">No tags</span>
    </div>
    <ul v-if="focused && options.length > 0"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 text-sm">
      <li v-for="(option, i) in options" :key="option.kind === 'existing' ? option.tag.id : '__create__'"
          :class="['flex cursor-pointer items-center justify-between gap-2 px-3 py-2',
                   i === highlightedIndex ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100']"
          @mouseenter="highlightedIndex = i"
          @mousedown.prevent="choose(option)">
        <template v-if="option.kind === 'existing'">
          <span class="truncate">#{{ option.tag.name }}</span>
          <span :class="['text-xs flex-shrink-0', i === highlightedIndex ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500']">
            {{ option.tag.noQuestions }} CQ{{ option.tag.noQuestions !== 1 ? 's' : '' }}
          </span>
        </template>
        <span v-else class="truncate">
          {{ creating ? 'Creating' : 'Create tag' }} <span class="font-semibold">#{{ option.name }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
