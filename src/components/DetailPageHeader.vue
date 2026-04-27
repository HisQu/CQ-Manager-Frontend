<script lang="ts" setup>
import {ChevronRightIcon} from "@heroicons/vue/20/solid";

defineProps<{
  title: string;
  project?: string;
  group?: string;
}>();
</script>

<template>
  <div class="flex items-start justify-between gap-4 flex-wrap">
    <div class="min-w-0">

      <!-- Breadcrumb badges -->
      <div v-if="project || group" class="flex items-center gap-1.5 flex-wrap mb-2">
        <span v-if="project"
              class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">
          {{ project }}
        </span>
        <ChevronRightIcon v-if="project && group" class="h-3.5 w-3.5 text-gray-400 flex-shrink-0"/>
        <span v-if="group"
              class="inline-flex items-center rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-700/10 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/30">
          {{ group }}
        </span>
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-semibold dark:text-white">{{ title }}</h1>

      <!-- Meta slot -->
      <div v-if="$slots.meta" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        <slot name="meta"/>
      </div>
    </div>

    <!-- Actions slot (right side) -->
    <div v-if="$slots.actions" class="flex flex-col items-end gap-1 flex-shrink-0">
      <slot name="actions"/>
    </div>
  </div>
</template>
