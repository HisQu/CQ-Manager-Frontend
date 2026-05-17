<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'TopicListItem',
  props: {
    topic: {
      type: Object as PropType<TopicT>,
      required: true,
    },
  },
});
</script>

<template>
  <RouterLink :to="'/catalogues/' + topic.projectId + '/' + topic.id">
    <div class="dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4 rounded-lg p-4 text-left shadow-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
      <div class="flex items-center gap-3">
        <span class="flex-shrink-0 inline-flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-400/20 px-2.5 py-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30 min-w-[2.5rem] text-center">
          {{ topic.identifier }}
        </span>
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ topic.name }}</h3>
        <span v-if="topic.questions !== undefined" class="ml-auto flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {{ topic.questions.length }} CQ{{ topic.questions.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>
