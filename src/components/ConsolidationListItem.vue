<script lang="ts">
import {defineComponent, PropType} from 'vue'
import SubmitButtonWithCallback from "./SubmitButtonWithCallback.vue";
import {TrashIcon} from "@heroicons/vue/20/solid";
import ConsolidationDataService from "../services/ConsolidationDataService.ts";

export default defineComponent({
  name: "ConsolidationListItem",

  props: {
    consolidation: {
      type: Object as PropType<ConsolidationReducedT>,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    resultQuestion: {
      type: Object as PropType<CompetencyQuestionReducedT>,
      required: false,
    },
    isOntologyEngineer: {
      type: Boolean,
      required: false,
    },
  },

  emits: ['deleted'],

  components: {SubmitButtonWithCallback, TrashIcon},

  methods: {
    async deleteConsolidation() {
      await ConsolidationDataService.delete(this.consolidation.id, this.projectId);
      this.$emit('deleted', this.consolidation.id);
    }
  }
})
</script>

<template>
  <RouterLink :to="'/consolidations/' + projectId + '/' + consolidation.id">
    <div class="dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4 rounded-lg p-4 text-left hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">

      <p class="font-medium dark:text-white text-gray-900 leading-snug">
        {{ resultQuestion?.question ?? '—' }}
      </p>

      <div class="mt-3 flex items-center justify-between">
        <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ consolidation.noQuestions }} source question{{ consolidation.noQuestions !== 1 ? 's' : '' }}
        </span>

        <div v-if="isOntologyEngineer" @click.prevent>
          <SubmitButtonWithCallback agree-button-text="Delete consolidation"
                                    title="Are you sure you want to delete this consolidation?"
                                    detail="This action is permanent. The source questions are not deleted."
                                    @modalsuccessclose="deleteConsolidation">
            <TrashIcon class="h-4 w-4" aria-hidden="true"/>
            Delete
          </SubmitButtonWithCallback>
        </div>
      </div>

    </div>
  </RouterLink>
</template>

<style scoped>
</style>
