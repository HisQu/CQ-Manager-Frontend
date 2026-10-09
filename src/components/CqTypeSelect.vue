<script setup lang="ts">
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {ChevronUpDownIcon, CheckIcon} from "@heroicons/vue/20/solid";
import CQTypeBadge from "./CQTypeBadge.vue";
import {CQ_TYPES, CQ_TYPE_LABELS, CQ_TYPE_HINTS} from "../constants/cqTypes.ts";

defineProps<{ disabled?: boolean }>();

const model = defineModel<CQType | null>({ required: true });
</script>

<template>
  <Listbox as="div" v-model="model" :disabled="disabled">
    <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
      {{ $t('type') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span>
    </ListboxLabel>
    <div class="relative mt-2">
      <ListboxButton class="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400">
        <!-- Badges in the same colours as in the CQ dashboard, followed by the type's description. -->
        <span v-if="model" class="flex items-center gap-2">
          <span class="w-16 flex-shrink-0"><CQTypeBadge :type="model" /></span>
          <span class="truncate">{{ CQ_TYPE_LABELS[model] }}</span>
        </span>
        <span v-else class="block truncate text-gray-500 dark:text-gray-400">{{ $t('noType') }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
          <ListboxOption v-for="type in [null, ...CQ_TYPES]" :key="type ?? ''" :value="type" v-slot="{ active, selected }" as="template">
            <li :class="[active ? 'bg-gray-100 dark:bg-gray-700' : '', 'relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-gray-100']">
              <span v-if="type" class="flex items-center gap-2">
                <span class="w-16 flex-shrink-0"><CQTypeBadge :type="type" /></span>
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">{{ CQ_TYPE_LABELS[type] }}</span>
              </span>
              <span v-else :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate text-gray-500 dark:text-gray-400']">{{ $t('noType') }}</span>
              <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
    <div v-if="model && CQ_TYPE_HINTS[model]" class="mt-1.5 rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
      <p><span class="font-medium">{{ $t('purpose') }}</span> {{ CQ_TYPE_HINTS[model]!.purpose }}</p>
      <p><span class="font-medium">{{ $t('mustInclude') }}</span> {{ CQ_TYPE_HINTS[model]!.mustInclude }}</p>
      <p><span class="font-medium">{{ $t('expectedAnswer') }}</span> {{ CQ_TYPE_HINTS[model]!.answer }}</p>
    </div>
  </Listbox>
</template>
