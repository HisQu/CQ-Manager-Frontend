<script lang="ts" setup>
import { t } from '../i18n'

import {ref, computed} from "vue";
import MessagePopup from "../components/MessagePopup.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import TermDataService from "../services/TermDataService.ts";
import ProjectDataService from "../services/ProjectDataService.ts";
import QuestionSelectorTable from "../components/QuestionSelectorTable.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ArrowDownOnSquareIcon, PencilSquareIcon, TrashIcon} from "@heroicons/vue/24/solid";
import {useStore} from "../store.ts";
import {groupFilterOptions} from "../utils/cqFilters.ts";

const store = useStore();

const messagePopupData = ref({
  uxresponse: { title: "", messageType: "" as UXResponse["messageType"], text: "", detail: "" },
  open: false
});

const termOccurrences = ref<CompetencyQuestionReducedT[]>();
const term = ref<TermT>();
// The edit form works on a copy, so the page keeps showing the saved term until the changes are saved.
const draft = ref({ content: "", definition: "", conceptIri: "" });
const editing = ref(false);
const projectName = ref("");
const canEdit = ref(false);

const props = defineProps(['id', 'projectid'])

async function fetchTerm() {
  const response = await TermDataService.getAllForOneProject(props.projectid);
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    term.value = response.data.find((t: TermT) => t.id === props.id);
    // Only ontology engineers (and system admins) may change terms, matching the backend.
    canEdit.value = response.data.permissionsProjectEngineer || store.getUser.isSystemAdmin;
  }
}

async function fetchOccurrences() {
  const response = await TermDataService.getQuestionsThatThisTermOccursIn(props.projectid, props.id);
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    termOccurrences.value = response.data;
  }
}

async function fetchProjectName() {
  const response = await ProjectDataService.getOne(props.projectid);
  if (!("messageType" in response)) projectName.value = response.data.name as string;
}

const occurrenceGroups = computed(() => groupFilterOptions(termOccurrences.value ?? []));
// The group options start with "All groups".
const uniqueGroupCount = computed(() => Math.max(occurrenceGroups.value.length - 1, 0));

function startEditing() {
  if (!term.value) return;
  draft.value = { content: term.value.content, definition: term.value.definition ?? "", conceptIri: term.value.conceptIri ?? "" };
  editing.value = true;
}

const saveConfirmDetail = computed(() => {
  if (!termOccurrences.value) return '';
  const qCount = termOccurrences.value.length;
  const gCount = uniqueGroupCount.value;
  if (qCount === 0) return t('termNotReferenced');
  return t('termRenameDetail', { questions: t('cqCount', qCount), groups: t('groupCount', gCount) });
});

const deleteConfirmDetail = computed(() => {
  if (!termOccurrences.value) return '';
  const qCount = termOccurrences.value.length;
  if (qCount === 0) return t('termDeletePermanent');
  return t('termDeleteDetail', { questions: t('questionCount', qCount) });
});

async function save() {
  const {content, definition, conceptIri} = draft.value;
  const response = await TermDataService.update(props.projectid, props.id, content.trim(), definition.trim() || null, conceptIri.trim() || null);
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    term.value = response.data;
    editing.value = false;
    messagePopupData.value.uxresponse = {
      title: t('saved'),
      messageType: "success",
      text: t('theTermHasBeenUpdated'),
      detail: "",
    };
    messagePopupData.value.open = true;
  }
}

async function deleteTerm() {
  await TermDataService.deleteTerm(props.projectid, props.id);
  history.back();
}

fetchTerm();
fetchOccurrences();
fetchProjectName();
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>

  <div v-if="term && termOccurrences !== undefined" class="w-full">

    <!-- Header -->
    <DetailPageHeader :title="term.content" :project="projectName">
      <template #meta>
        <span class="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20">
          {{ $t('term2') }}
        </span>
        <span v-if="termOccurrences.length > 0" class="ml-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ $t('occurrenceCount', termOccurrences.length) }}
          <template v-if="uniqueGroupCount > 0"> {{ $t('in') }} {{ $t('groupCount', uniqueGroupCount) }}</template>
        </span>
      </template>
      <template v-if="canEdit && !editing" #actions>
        <button type="button"
                class="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-300 dark:ring-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
                @click="startEditing">
          <PencilSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
          {{ $t('edit') }}
        </button>
      </template>
    </DetailPageHeader>

    <!-- Edit form — ontology engineers only -->
    <div v-if="editing" class="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
      <h2 class="text-lg font-semibold dark:text-white mb-4">{{ $t('editTerm') }}</h2>

      <div class="mb-6">
        <label for="term-content" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          {{ $t('termName') }}
        </label>
        <input type="text" v-model="draft.content" id="term-content"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
      </div>

      <div class="mb-6">
        <label for="term-definition" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          {{ $t('definition') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span>
        </label>
        <textarea v-model="draft.definition" id="term-definition" rows="3"
                  :placeholder="$t('humanReadableDefinitionOfThisTerm')"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
      </div>

      <div class="mb-6">
        <label for="term-concept-iri" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          {{ $t('conceptIRI') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span>
        </label>
        <input type="text" v-model="draft.conceptIri" id="term-concept-iri"
               placeholder="https://example.org/ontology/Term"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
      </div>

      <div class="flex items-center justify-between">
        <SubmitButtonWithCallback
          :agree-button-text="$t('deleteTerm')"
          :title="$t('deleteThisTerm')"
          :detail="deleteConfirmDetail"
          @modalsuccessclose="deleteTerm">
          <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
          {{ $t('delete') }}
        </SubmitButtonWithCallback>

        <div class="flex items-center gap-3">
          <button type="button"
                  class="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="editing = false">
            {{ $t('cancel') }}
          </button>
          <SubmitButtonWithCallback
            :agree-button-text="$t('renameTerm')"
            :title="$t('renameThisTerm')"
            :detail="saveConfirmDetail"
            @modalsuccessclose="save">
            <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
            {{ $t('save') }}
          </SubmitButtonWithCallback>
        </div>
      </div>
    </div>

    <template v-else>
      <p v-if="term.definition" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {{ term.definition }}
      </p>
      <a v-if="term.conceptIri && /^https?:\/\//i.test(term.conceptIri)" :href="term.conceptIri" target="_blank" rel="noopener noreferrer"
         class="mt-1 inline-block text-sm text-indigo-600 dark:text-indigo-400 underline break-all">
        {{ term.conceptIri }}
      </a>
      <p v-else-if="term.conceptIri" class="mt-1 text-sm text-gray-500 dark:text-gray-400 break-all">
        {{ term.conceptIri }}
      </p>
    </template>

    <hr class="my-6 border-gray-200 dark:border-gray-700"/>

    <!-- Occurrences, searchable and filterable like the CQ dashboard -->
    <h2 class="text-lg font-semibold dark:text-white mb-3">
      {{ $t('occurrences') }}
      <span class="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ termOccurrences.length }}</span>
    </h2>

    <div v-if="termOccurrences.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      {{ $t('thisTermIsNotUsedInAnyQuestionYet') }}
    </div>

    <QuestionSelectorTable v-else :cqs="termOccurrences" :groups="occurrenceGroups" :selectable="false" :inherit-dashboard-filters="false">
      <template #header>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('competencyQuestionsInThisProjectThatReferenceThisTerm') }}
        </p>
      </template>
    </QuestionSelectorTable>
  </div>

  <!-- Loading skeleton -->
  <div v-else class="w-full animate-pulse space-y-4">
    <div class="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
    <div class="h-px w-full bg-gray-200 dark:bg-gray-700 mt-6"></div>
    <div class="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
    <div class="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-md mt-2"></div>
    <div class="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
  </div>
</template>

<style scoped>
</style>
