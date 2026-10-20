<script lang="ts">
import {defineComponent, PropType} from 'vue';

export default defineComponent({
  name: "TermListItem",

  props: {
    term: {
      type: Object as PropType<TermT>,
      required: true
    },
  },
})
</script>

<template>
  <RouterLink :to="'/terms/' + term.projectId + '/' + term.id">
    <div class="dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4 rounded-lg p-4 text-left shadow-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
      <div class="flex items-center gap-3">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ term.content }}</h3>
        <span v-if="term.noQuestions != null"
              :class="[term.noQuestions
                ? 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30'
                : 'bg-gray-50 text-gray-500 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
                'ml-auto flex-shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
          {{ $t('cqCount', term.noQuestions) }}
        </span>
      </div>
      <p v-if="term.definition" class="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{{ term.definition }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>

</style>