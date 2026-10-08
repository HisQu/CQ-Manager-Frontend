<script setup lang="ts">
import {computed} from "vue";
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {ChevronUpDownIcon, CheckIcon, XMarkIcon} from "@heroicons/vue/20/solid";

// Like FilterSelect, but several values can be chosen; nothing chosen means "no filter" and shows the placeholder.
const props = defineProps<{
  label: string;
  placeholder: string;
  // `prefix` is shown in bold before the label, e.g. a catalogue identifier.
  options: { value: string; label: string; prefix?: string }[];
}>();

const model = defineModel<string[]>({ required: true });

const selectedOptions = computed(() => props.options.filter(o => model.value.includes(o.value)));
const summary = computed(() => {
  if (selectedOptions.value.length === 0) return props.placeholder;
  return selectedOptions.value.map(o => [o.prefix, o.label].filter(Boolean).join(' ')).join(', ');
});
</script>

<template>
  <Listbox as="div" v-model="model" multiple>
    <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">{{ label }}</ListboxLabel>
    <div class="relative mt-2">
      <ListboxButton :class="[model.length ? 'ring-indigo-500 dark:ring-indigo-400' : 'ring-gray-300 dark:ring-gray-600',
                              'relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6',
                              model.length ? 'pr-16' : 'pr-10']"
                     :title="summary">
        <span class="flex items-center gap-1.5">
          <span v-if="model.length > 1"
                class="flex-shrink-0 inline-flex items-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
            {{ model.length }}
          </span>
          <span :class="['block truncate', model.length ? '' : 'text-gray-500 dark:text-gray-400']">{{ summary }}</span>
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>
      <button v-if="model.length"
              type="button"
              class="absolute inset-y-0 right-7 flex items-center px-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              :aria-label="$t('clearFilter', { label })"
              @click="model = []">
        <XMarkIcon class="h-4 w-4" aria-hidden="true" />
      </button>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
          <ListboxOption as="template" v-for="o in options" :key="o.value" :value="o.value" v-slot="{ active, selected }">
            <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'flex items-center gap-1.5 truncate']">
                <span v-if="o.prefix" class="font-bold">{{ o.prefix }}</span>{{ o.label }}
              </span>
              <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
