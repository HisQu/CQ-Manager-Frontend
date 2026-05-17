<script setup lang="ts">
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {computed, ref} from "vue";
import {TrashIcon, ArrowDownOnSquareIcon, ArrowTopRightOnSquareIcon, CheckIcon, ChevronUpDownIcon} from "@heroicons/vue/24/solid";
import {useStore} from "../store.ts";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
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

const CQ_TYPES: CQType[] = ["SCQ", "VCQ", "FCQ", "RCQ", "aRCQ", "efRCQ", "drRCQ", "rpRCQ", "MpCQ"]

const consolidation = ref<ConsolidationT | null>(null);
const cqs = ref<CompetencyQuestionReducedT[]>([]);
const canEdit = ref(false);
const resultQuestionText = ref("");
const resultQuestionReference = ref<string | null>(null);
const resultQuestionAnchor = ref<string | null>(null);
const resultQuestionExampleAnswer = ref<string | null>(null);
const resultQuestionType = ref<CQType | null>(null);
const savingResultQuestion = ref(false);
const newResultCq = ref<CompetencyQuestionReducedT | null>(null);
const currentSourceSelection = ref<string[]>([]);

const sourceCqs = computed(() => {
  const resultId = consolidation.value?.targetQuestion?.id;
  return resultId ? cqs.value.filter(q => q.id !== resultId) : cqs.value;
});

const sourceSelectedIds = computed(() =>
  (consolidation.value?.sourceQuestions ?? []).map(q => q.id)
);

const cqGroupMap = computed(() => {
  const map = new Map<string, string>();
  for (const q of cqs.value) {
    const gid = q.groupId ?? q.group?.id;
    if (gid) map.set(q.id, gid);
  }
  return map;
});

function groupIdFor(q: { id: string; groupId?: string; group?: { id: string } }): string | undefined {
  return q.groupId ?? q.group?.id ?? cqGroupMap.value.get(q.id);
}

const sourceGroups = computed(() => {
  const seen = new Set<string>();
  const result: { id: string; name: string }[] = [{ id: '', name: 'All groups' }];
  for (const q of cqs.value) {
    const id = q.group?.id ?? q.groupId;
    const name = q.group?.name;
    if (id && name && !seen.has(id)) { seen.add(id); result.push({ id, name }); }
  }
  return result.length > 1 ? result : [];
});

const savingSourceQuestions = ref(false);

async function saveSourceQuestions(selectedIds: string[]) {
  const current = new Set(sourceSelectedIds.value);
  const next = new Set(selectedIds);
  const toAdd = selectedIds.filter(id => !current.has(id));
  const toRemove = sourceSelectedIds.value.filter(id => !next.has(id));
  const projectId = consolidation.value!.project!.id;

  savingSourceQuestions.value = true;
  const calls: Promise<any>[] = [];
  if (toAdd.length) calls.push(ConsolidationDataService.addQuestions(props.id, projectId, toAdd));
  if (toRemove.length) calls.push(ConsolidationDataService.removeQuestions(props.id, projectId, toRemove));
  const results = await Promise.all(calls);
  savingSourceQuestions.value = false;

  for (const r of results) {
    if ("messageType" in r) { showError(r); return; }
  }
  await fetchConsolidation();
}

fetchAll();

function showError(response: UXResponse) {
  messagePopupData.value.uxresponse = {...messagePopupData.value.uxresponse, ...response};
  messagePopupData.value.open = true;
}

async function fetchConsolidation() {
  const projectId = consolidation.value?.project?.id ?? props.projectid;
  const response = await ConsolidationDataService.getOne(props.id, projectId);
  if ("messageType" in response) {
    showError(response);
  } else {
    consolidation.value = response.data;
    const rq = response.data.targetQuestion;
    resultQuestionText.value = rq?.question ?? "";
    resultQuestionReference.value = rq?.reference ?? null;
    resultQuestionAnchor.value = rq?.anchor ?? null;
    resultQuestionExampleAnswer.value = rq?.exampleAnswer ?? null;
    resultQuestionType.value = rq?.type ?? null;
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
  const rq0 = consoResp.data.targetQuestion;
  resultQuestionText.value = rq0?.question ?? "";
  resultQuestionReference.value = rq0?.reference ?? null;
  resultQuestionAnchor.value = rq0?.anchor ?? null;
  resultQuestionExampleAnswer.value = rq0?.exampleAnswer ?? null;
  resultQuestionType.value = rq0?.type ?? null;

  if ("messageType" in cqsResp) {
    showError(cqsResp);
  } else {
    cqs.value = cqsResp.data;
  }
}

async function saveResultQuestion() {
  const rq = consolidation.value?.targetQuestion;
  if (!rq) return;
  const groupId = groupIdFor(rq);
  if (!groupId) return;

  savingResultQuestion.value = true;
  const response = await CompetencyQuestionDataService.change(
    resultQuestionText.value, [], groupId, rq.id, undefined, undefined,
    {
      reference: resultQuestionReference.value,
      anchor: resultQuestionAnchor.value,
      exampleAnswer: resultQuestionExampleAnswer.value,
      type: resultQuestionType.value,
    }
  );
  savingResultQuestion.value = false;

  if ("messageType" in response) {
    showError(response);
  }
}

async function setResultQuestion() {
  if (!newResultCq.value) return;
  const response = await ConsolidationDataService.update(props.id, consolidation.value!.project!.id, {
    targetQuestion: { id: newResultCq.value.id },
  });
  if ("messageType" in response) {
    showError(response);
  } else {
    newResultCq.value = null;
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
        <span v-if="(consolidation.sourceQuestions?.length ?? 0) > 0"
              class="ml-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ consolidation.sourceQuestions!.length }} source question{{ consolidation.sourceQuestions!.length !== 1 ? 's' : '' }}
        </span>
      </template>
      <template v-if="canEdit" #actions>
        <SubmitButtonWithCallback agree-button-text="Delete"
                                  title="Are you sure you want to delete this consolidation?"
                                  detail="This action is permanent. The source questions are not deleted."
                                  @modalsuccessclose="ConsolidationDataService.delete(consolidation.id, consolidation.project!.id); $router.push('/consolidations/');">
          <TrashIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
          Delete
        </SubmitButtonWithCallback>
      </template>
    </DetailPageHeader>

    <!-- Target Question -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-semibold dark:text-white">Target Question</h2>
        <RouterLink v-if="consolidation.targetQuestion"
                    :to="`/questions/${groupIdFor(consolidation.targetQuestion)}/${consolidation.targetQuestion.id}`"
                    class="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
          Open CQ
          <ArrowTopRightOnSquareIcon class="h-4 w-4"/>
        </RouterLink>
      </div>

      <div v-if="consolidation.targetQuestion" class="space-y-3">
        <div class="relative rounded-md shadow-sm">
          <input type="text"
                 :disabled="!canEdit"
                 v-model="resultQuestionText"
                 placeholder="No question text"
                 class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-60 disabled:cursor-not-allowed"/>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Type <span class="font-normal text-gray-400">(optional)</span>
            </label>
            <select :disabled="!canEdit" v-model="resultQuestionType"
                    class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed">
              <option :value="null">—</option>
              <option v-for="t in CQ_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Reference (Fundstelle) <span class="font-normal text-gray-400">(optional)</span>
            </label>
            <input type="text" :disabled="!canEdit" v-model="resultQuestionReference"
                   placeholder="e.g. S. 138."
                   class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"/>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Anchor (Beleganker) <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea :disabled="!canEdit" v-model="resultQuestionAnchor" rows="2"
                    placeholder="Source text or evidence..."
                    class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"/>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Example Answer <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea :disabled="!canEdit" v-model="resultQuestionExampleAnswer" rows="2"
                    placeholder="Sample or example answer..."
                    class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"/>
        </div>

        <div v-if="canEdit" class="flex justify-end">
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
        <p class="text-sm text-gray-500 dark:text-gray-400">No target question set. Pick an existing CQ to use as the target question.</p>
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
            Set Target Question
          </button>
        </div>
      </div>

      <div v-else>
        <p class="text-sm text-gray-500 dark:text-gray-400">No target question set.</p>
      </div>
    </div>

    <!-- Source Questions -->
    <div class="mt-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold dark:text-white">Source Questions</h2>
        <button v-if="canEdit"
                type="button"
                @click="saveSourceQuestions(currentSourceSelection)"
                :disabled="savingSourceQuestions"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed">
          <ArrowDownOnSquareIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
          {{ savingSourceQuestions ? 'Saving…' : 'Save source questions' }}
        </button>
      </div>

      <QuestionSelectorTable
        :cqs="sourceCqs"
        :groups="sourceGroups"
        :initialSelectedIds="sourceSelectedIds"
        @selectionChanged="currentSourceSelection = $event">
        <template #header>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Checked questions are currently included in this consolidation.
            <span v-if="canEdit">Check or uncheck to add or remove, then save.</span>
          </p>
        </template>
      </QuestionSelectorTable>
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
