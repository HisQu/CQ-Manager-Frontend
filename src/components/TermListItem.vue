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
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>

</style>