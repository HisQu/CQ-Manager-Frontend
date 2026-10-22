<!--
  * Lists the source questions of a consolidation
  * lets users who may edit the consolidation add or remove source questions
-->

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/24/solid";
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import QuestionSelectorTable from "./QuestionSelectorTable.vue";
import {groupFilterOptions} from "../utils/cqFilters.ts";
import {useStore} from "../store.ts";

const props = defineProps<{
  consolidation: ConsolidationT;
  projectId: string;
  canEdit: boolean;
}>();
const emit = defineEmits<{saved: [], error: [response: UXResponse]}>();
const store = useStore();

const cqs = ref<CompetencyQuestionReducedT[]>([]);
const currentSourceSelection = ref<string[]>([]);
const savingSourceQuestions = ref(false);

watch(() => props.projectId, async (projectId) => {
  const response = await CompetencyQuestionDataService.getAllForOneProject(projectId);
  if ("messageType" in response) emit('error', response);
  else cqs.value = response.data;
}, {immediate: true});

const sourceSelectedIds = computed(() => (props.consolidation.sourceQuestions ?? []).map(q => q.id));

// The target question cannot be its own source.
const sourceCqs = computed(() => {
  const targetId = props.consolidation.targetQuestion?.id;
  return targetId ? cqs.value.filter(q => q.id !== targetId) : cqs.value;
});

// Read-only users only see the questions that are part of the consolidation.
const includedCqs = computed(() => {
  const ids = new Set(sourceSelectedIds.value);
  return cqs.value.filter(q => ids.has(q.id));
});

const sourceGroups = computed(() => groupFilterOptions(cqs.value));

async function saveSourceQuestions(selectedIds: string[]) {
  const current = new Set(sourceSelectedIds.value);
  const next = new Set(selectedIds);
  const toAdd = selectedIds.filter(id => !current.has(id));
  const toRemove = sourceSelectedIds.value.filter(id => !next.has(id));
  const consolidationId = props.consolidation.id;

  savingSourceQuestions.value = true;
  const calls: Promise<any>[] = [];
  if (toAdd.length) calls.push(ConsolidationDataService.addQuestions(consolidationId, props.projectId, toAdd));
  if (toRemove.length) calls.push(ConsolidationDataService.removeQuestions(consolidationId, props.projectId, toRemove));
  const results = await Promise.all(calls);
  savingSourceQuestions.value = false;

  for (const r of results) {
    if ("messageType" in r) { emit('error', r); return; }
  }
  emit('saved');
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold dark:text-white">{{ $t('sourceQuestions') }}</h2>
      <button v-if="canEdit"
              type="button"
              @click="saveSourceQuestions(currentSourceSelection)"
              :disabled="savingSourceQuestions"
              class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed">
        <ArrowDownOnSquareIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
        {{ savingSourceQuestions ? 'Saving…' : $t('saveSourceQuestions') }}
      </button>
    </div>

    <QuestionSelectorTable
      :cqs="canEdit ? sourceCqs : includedCqs"
      :groups="sourceGroups"
      :initialSelectedIds="sourceSelectedIds"
      :initialGroup="canEdit ? store.cqSelectedGroup : null"
      :selectable="canEdit"
      @selectionChanged="currentSourceSelection = $event">
      <template #header>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          <template v-if="canEdit">
            {{ $t('checkedQuestionsAreCurrentlyIncludedInThisConsolidationCheckOrUncheckToAddOrRemoveThe') }}
          </template>
          <template v-else>{{ $t('questionsIncludedInThisConsolidation') }}</template>
        </p>
      </template>
    </QuestionSelectorTable>
  </div>
</template>
