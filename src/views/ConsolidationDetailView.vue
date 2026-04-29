<script setup lang="ts">
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {computed, ref} from "vue";
import {TrashIcon, ArrowDownOnSquareIcon, XMarkIcon, ArrowTopRightOnSquareIcon, CheckIcon, ChevronUpDownIcon} from "@heroicons/vue/24/solid";
import {useStore} from "../store.ts";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import CompetencyQuestionListItem from "../components/CompetencyQuestionListItem.vue";
import QuestionSelectorTable from "../components/QuestionSelectorTable.vue";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/vue";

const props = defineProps(['id', 'projectid'])
const store = useStore()

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false
})

const consolidation = ref<ConsolidationT | null>(null);
const cqs = ref<CompetencyQuestionReducedT[]>([]);
const canEdit = ref(false);
const resultQuestionText = ref("");
const savingResultQuestion = ref(false);
const newResultCq = ref<CompetencyQuestionReducedT | null>(null);

const addableCqs = computed(() => {
  const excludedIds = new Set<string>([
    ...((consolidation.value?.questions ?? []).map(q => q.id)),
    ...(consolidation.value?.resultQuestion?.id ? [consolidation.value.resultQuestion.id] : []),
  ]);
  return cqs.value.filter(q => !excludedIds.has(q.id));
});

fetchAll();

function showError(response: UXResponse) {
  messagePopupData.value.uxresponse = {...messagePopupData.value.uxresponse, ...response};
  messagePopupData.value.open = true;
}

async function fetchConsolidation() {
  const response = await ConsolidationDataService.getOne(props.id, props.projectid);
  if ("messageType" in response) {
    showError(response);
  } else {
    consolidation.value = response.data;
    resultQuestionText.value = response.data.resultQuestion?.question ?? "";
  }
}

async function fetchAll() {
  const [consoResp, cqsResp] = await Promise.all([
    ConsolidationDataService.getOne(props.id, props.projectid),
    CompetencyQuestionDataService.getAllForOneProject(props.projectid),
  ]);

  if ("messageType" in consoResp) {
    showError(consoResp);
    return;
  }
  consolidation.value = consoResp.data;
  canEdit.value = (consoResp.data as any).permissionsProjectEngineer ?? false;
  resultQuestionText.value = consoResp.data.resultQuestion?.question ?? "";

  if ("messageType" in cqsResp) {
    showError(cqsResp);
  } else {
    cqs.value = cqsResp.data;
  }
}

async function saveResultQuestion() {
  const rq = consolidation.value?.resultQuestion;
  if (!rq) return;
  const groupId = rq.groupId ?? rq.group?.id;
  if (!groupId) return;

  savingResultQuestion.value = true;
  const response = await CompetencyQuestionDataService.change(
    resultQuestionText.value, [], groupId, rq.id
  );
  savingResultQuestion.value = false;

  if ("messageType" in response) {
    showError(response);
  }
}

async function setResultQuestion() {
  if (!newResultCq.value) return;
  const response = await ConsolidationDataService.update(props.id, props.projectid, {
    resultQuestionId: newResultCq.value.id,
  });
  if ("messageType" in response) {
    showError(response);
  } else {
    newResultCq.value = null;
    await fetchConsolidation();
  }
}

async function addQuestions(questionIds: string[]) {
  const response = await ConsolidationDataService.addQuestions(props.id, props.projectid, questionIds);
  if ("messageType" in response) {
    showError(response);
  } else {
    await fetchConsolidation();
  }
}

async function removeQuestion(questionId: string) {
  const response = await ConsolidationDataService.removeQuestions(props.id, props.projectid, [questionId]);
  if ("messageType" in response) {
    showError(response);
  } else {
    await fetchConsolidation();
  }
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>

  <div v-if="consolidation" class="w-full">
    <DetailPageHeader title="Consolidation" :project="consolidation.project?.name ?? store.getProject.name">
      <template #meta>
        <span v-if="consolidation.engineer">
          By <span class="font-medium text-gray-700 dark:text-gray-200">{{ consolidation.engineer.name }}</span>
        </span>
        <span v-if="(consolidation.questions?.length ?? 0) > 0"
              class="ml-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ consolidation.questions!.length }} source question{{ consolidation.questions!.length !== 1 ? 's' : '' }}
        </span>
      </template>
      <template v-if="canEdit" #actions>
        <SubmitButtonWithCallback agree-button-text="Delete"
                                  title="Are you sure you want to delete this consolidation?"
                                  detail="This action is permanent. The source questions are not deleted."
                                  @modalsuccessclose="ConsolidationDataService.delete(consolidation.id, props.projectid); $router.push('/consolidations/');">
          <TrashIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
          Delete
        </SubmitButtonWithCallback>
      </template>
    </DetailPageHeader>

    <!-- Result Question -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-semibold dark:text-white">Result Question</h2>
        <RouterLink v-if="consolidation.resultQuestion"
                    :to="`/questions/${consolidation.resultQuestion.group?.id ?? consolidation.resultQuestion.groupId}/${consolidation.resultQuestion.id}`"
                    class="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
          Open CQ
          <ArrowTopRightOnSquareIcon class="h-4 w-4"/>
        </RouterLink>
      </div>

      <div v-if="consolidation.resultQuestion">
        <div class="relative rounded-md shadow-sm">
          <input type="text"
                 :disabled="!canEdit"
                 v-model="resultQuestionText"
                 placeholder="No question text"
                 class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-60 disabled:cursor-not-allowed"/>
        </div>
        <div v-if="canEdit" class="mt-3 flex justify-end">
          <button type="button"
                  @click="saveResultQuestion"
                  :disabled="savingResultQuestion"
                  class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed">
            <ArrowDownOnSquareIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
            {{ savingResultQuestion ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <div v-else-if="canEdit" class="space-y-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">No result question set. Pick an existing CQ to use as the result question.</p>
        <Listbox v-model="newResultCq">
          <div class="relative">
            <ListboxButton
              class="relative w-full cursor-default rounded-md py-2 pl-3 pr-10 text-left text-sm shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <span :class="['block truncate', newResultCq ? '' : 'text-gray-400']">
                {{ newResultCq ? newResultCq.question : 'Select a CQ...' }}
              </span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon class="h-4 w-4 text-gray-400" aria-hidden="true"/>
              </span>
            </ListboxButton>
            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none">
                <ListboxOption as="template" v-for="cq in cqs" :key="cq.id" :value="cq" v-slot="{ active, selected }">
                  <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ cq.question }}</span>
                    <span :class="[active ? 'text-indigo-200' : 'text-gray-400', 'block text-xs truncate']">{{ cq.group?.name }}</span>
                    <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-3']">
                      <CheckIcon class="h-4 w-4" aria-hidden="true"/>
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
        <div class="flex justify-end">
          <button type="button"
                  :disabled="!newResultCq"
                  @click="setResultQuestion"
                  class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <CheckIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
            Set Result Question
          </button>
        </div>
      </div>

      <div v-else>
        <p class="text-sm text-gray-500 dark:text-gray-400">No result question set.</p>
      </div>
    </div>

    <!-- Source Questions -->
    <div class="mt-10">
      <h2 class="text-lg font-semibold dark:text-white mb-3">Source Questions</h2>

      <div v-if="!consolidation.questions?.length" class="text-sm text-gray-500 dark:text-gray-400">
        No source questions linked yet.
      </div>

      <div v-for="cq in consolidation.questions" :key="cq.id" class="flex items-center mt-3">
        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded w-full mr-3">
          <CompetencyQuestionListItem :text="cq.question"
                                      :groupIdentifier="cq.groupId ?? cq.group?.id"
                                      :identifier="cq.id"/>
        </div>
        <div v-if="canEdit">
          <button @click="removeQuestion(cq.id)"
                  class="hover:dark:bg-gray-700 hover:bg-gray-100 hover:text-red-400 p-2 rounded transition-colors"
                  title="Remove from consolidation">
            <XMarkIcon class="h-7 w-7"/>
          </button>
        </div>
      </div>

      <div v-if="canEdit" class="mt-8">
        <h3 class="text-base font-medium dark:text-white mb-3">Add Source Questions</h3>
        <QuestionSelectorTable :cqs="addableCqs" @selectionWasMade="addQuestions">
          Add to consolidation
        </QuestionSelectorTable>
      </div>
    </div>
  </div>

  <!-- Loading skeleton -->
  <div v-else class="w-full animate-pulse space-y-4">
    <div class="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div class="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
    <div class="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
    <div class="h-px w-full bg-gray-200 dark:bg-gray-700 mt-6"></div>
    <div class="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md mt-4"></div>
  </div>
</template>

<style scoped>
</style>
