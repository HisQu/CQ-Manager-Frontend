<script setup lang="ts">
import {AdjustmentsHorizontalIcon} from "@heroicons/vue/20/solid";

defineProps<{
  activeCount: number;
}>();

const open = defineModel<boolean>({ required: true });
</script>

<template>
  <button type="button"
          :aria-expanded="open"
          class="flex-shrink-0 inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          @click="open = !open">
    <AdjustmentsHorizontalIcon class="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
    Filters
    <span v-if="activeCount"
          class="inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
      {{ activeCount }}
    </span>
  </button>
</template>
