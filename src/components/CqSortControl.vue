<script setup lang="ts">
import {computed} from "vue";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {ArrowsUpDownIcon, BarsArrowDownIcon, BarsArrowUpIcon, CheckIcon} from "@heroicons/vue/20/solid";
import {CQ_SORT_FIELDS, type CqSort, type CqSortField, defaultDirectionOf} from "../utils/cqSort.ts";

// Sort field picker plus a direction toggle, styled like the Filters button next to it.
defineProps<{
  size?: 'sm';
}>();

const sort = defineModel<CqSort>({ required: true });

const field = computed({
  get: () => sort.value.field,
  set: (value: CqSortField) => { sort.value = { field: value, direction: defaultDirectionOf(value) }; },
});

const fieldLabel = computed(() => CQ_SORT_FIELDS.find(f => f.value === sort.value.field)?.label ?? '');

// Text sorts read naturally as A–Z, numbers and dates as low/old to high/new.
const isText = computed(() => ['question', 'author', 'group', 'type'].includes(sort.value.field));
const directionLabel = computed(() => {
  const asc = sort.value.direction === 'asc';
  if (isText.value) return asc ? 'A → Z' : 'Z → A';
  if (sort.value.field === 'catalogue') return asc ? 'First → last' : 'Last → first';
  if (['created', 'updated', 'lastComment'].includes(sort.value.field)) return asc ? 'Oldest first' : 'Newest first';
  return asc ? 'Lowest first' : 'Highest first';
});

function toggleDirection() {
  sort.value = { ...sort.value, direction: sort.value.direction === 'asc' ? 'desc' : 'asc' };
}
</script>

<template>
  <div class="flex flex-shrink-0 items-center rounded-md shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-800">
    <Listbox v-model="field">
      <div class="relative">
        <ListboxButton :class="['inline-flex items-center gap-x-2 rounded-l-md px-3 font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                                size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm']"
                       :title="`Sort by ${fieldLabel}`">
          <ArrowsUpDownIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span><span class="font-normal text-gray-500 dark:text-gray-400">Sort:</span> {{ fieldLabel }}</span>
        </ListboxButton>
        <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <ListboxOptions class="absolute right-0 z-20 mt-1 max-h-72 w-60 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none">
            <ListboxOption as="template" v-for="f in CQ_SORT_FIELDS" :key="f.value" :value="f.value" v-slot="{ active, selected }">
              <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ f.label }}</span>
                <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-3']">
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    <button type="button"
            :class="['inline-flex items-center gap-x-1.5 rounded-r-md border-l border-gray-300 dark:border-gray-600 px-2.5 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
                     size === 'sm' ? 'py-1 text-xs' : 'py-1.5 text-sm']"
            :title="`${directionLabel} — click to reverse`"
            @click="toggleDirection">
      <BarsArrowUpIcon v-if="sort.direction === 'asc'" class="h-5 w-5 text-gray-400" aria-hidden="true" />
      <BarsArrowDownIcon v-else class="h-5 w-5 text-gray-400" aria-hidden="true" />
      {{ directionLabel }}
    </button>
  </div>
</template>
