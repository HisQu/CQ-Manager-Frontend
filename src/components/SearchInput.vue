<script setup lang="ts">
import {MagnifyingGlassIcon} from "@heroicons/vue/20/solid";

defineProps<{
  placeholder: string;
}>();

const query = defineModel<string>({ required: true });
</script>

<template>
  <div>
    <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">{{ $t('search') }}</label>
    <div class="relative mt-2">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
      <input v-model="query"
             type="text"
             :placeholder="placeholder"
             class="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6" />
    </div>
  </div>
</template>
