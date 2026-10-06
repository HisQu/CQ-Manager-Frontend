<script setup lang="ts">
import {computed} from "vue";
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {ChevronUpDownIcon, CheckIcon} from "@heroicons/vue/20/solid";

const props = defineProps<{
  label: string;
  options: { value: string; label: string }[];
}>();

const model = defineModel<string>({ required: true });

const selectedLabel = computed(() => props.options.find(o => o.value === model.value)?.label ?? '');
// The first option is the "no filter" option; highlight the control when anything else is chosen.
const isActive = computed(() => props.options.length > 0 && model.value !== props.options[0].value);
</script>

<template>
  <Listbox as="div" v-model="model">
    <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">{{ label }}</ListboxLabel>
    <div class="relative mt-2">
      <ListboxButton :class="[isActive ? 'ring-indigo-500 dark:ring-indigo-400' : 'ring-gray-300 dark:ring-gray-600',
                              'relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6']">
        <span class="block truncate">{{ selectedLabel }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
          <ListboxOption as="template" v-for="o in options" :key="o.value" :value="o.value" v-slot="{ active, selected }">
            <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ o.label }}</span>
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
