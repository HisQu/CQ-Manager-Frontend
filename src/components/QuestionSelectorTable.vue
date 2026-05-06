<script lang="ts">
import {defineComponent, PropType} from 'vue'

export default defineComponent({
  name: "QuestionSelectorTable",
  props: {
    cqs: {
      type: Object as PropType<CompetencyQuestionReducedT[]>,
      required: true,
    }
  },
  data() {
    return {
      selectedIds: [] as string[]
    }
  },
  computed: {
    indeterminate(): boolean {
      return this.selectedIds.length > 0 && this.selectedIds.length < this.cqs.length
    },
    allSelected(): boolean {
      return this.cqs.length > 0 && this.selectedIds.length === this.cqs.length
    }
  },
  emits: ['selectionWasMade', 'selectionChanged'],
  watch: {
    cqs(newCqs: CompetencyQuestionReducedT[]) {
      const validIds = new Set(newCqs.map(q => q.id));
      const filtered = this.selectedIds.filter(id => validIds.has(id));
      if (filtered.length !== this.selectedIds.length) {
        this.selectedIds = filtered;
        this.$emit('selectionChanged', this.selectedIds);
      }
    },
    selectedIds(newIds: string[]) {
      this.$emit('selectionChanged', newIds);
    }
  },
  methods: {
    toggleAll(checked: boolean) {
      this.selectedIds = checked ? this.cqs.map(cq => cq.id) : [];
    },
    clearSelection() {
      this.selectedIds = [];
    },
    handleAction() {
      this.$emit('selectionWasMade', this.selectedIds.slice());
      this.clearSelection();
    }
  }
})
</script>

<template>
  <div class="rounded-lg ring-1 ring-gray-200 dark:ring-gray-700">
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
      <div>
        <slot name="header">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Select questions using the checkbox at the front.
            <span class="dark:text-blue-300 text-blue-600">Blue</span> rows are already part of another consolidation.
          </p>
        </slot>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0 ml-4">
        <span v-if="selectedIds.length > 0"
              class="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-400/10 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
          {{ selectedIds.length }} selected
        </span>
        <button v-if="$slots.default && selectedIds.length > 0"
                type="button"
                @click="handleAction"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <slot></slot>
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-800/50">
            <th scope="col" class="relative w-12 px-5">
              <input type="checkbox"
                     class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                     :checked="allSelected"
                     :indeterminate="indeterminate"
                     @change="toggleAll(($event.target as HTMLInputElement).checked)"/>
            </th>
            <th scope="col" class="py-3 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Question</th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Group</th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Author</th>
            <th scope="col" class="relative py-3 pl-3 pr-5"><span class="sr-only">View</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr v-if="cqs.length === 0">
            <td colspan="5" class="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No questions available.
            </td>
          </tr>
          <tr v-for="cq in cqs" :key="cq.id"
              :class="[
                selectedIds.includes(cq.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-900',
                (cq as any).noConsolidations > 0 && !selectedIds.includes(cq.id) ? 'bg-blue-50 dark:bg-blue-900/20' : '',
              ]">
            <td class="relative w-12 px-5">
              <div v-if="selectedIds.includes(cq.id)"
                   class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div>
              <input type="checkbox"
                     class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                     :value="cq.id"
                     v-model="selectedIds"/>
            </td>
            <td class="py-3.5 pr-3 text-sm"
                :class="selectedIds.includes(cq.id) ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'">
              {{ cq.question }}
            </td>
            <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">{{ cq.group?.name }}</td>
            <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">{{ cq.author?.name }}</td>
            <td class="py-3.5 pl-3 pr-5 text-right text-sm">
              <RouterLink :to="`/questions/${cq.group?.id ?? cq.groupId}/${cq.id}`"
                          class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                View
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
</style>
