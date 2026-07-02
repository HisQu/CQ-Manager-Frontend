<script lang="ts" setup>
import {ref, computed} from "vue";
import MessagePopup from "../components/MessagePopup.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import TermDataService from "../services/TermDataService.ts";
import ProjectDataService from "../services/ProjectDataService.ts";
import CQListItem from "../components/CQListItem.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ArrowDownOnSquareIcon, TrashIcon} from "@heroicons/vue/24/solid";
import {useStore} from "../store.ts";

const store = useStore();

const messagePopupData = ref({
  uxresponse: { title: "", messageType: "" as UXResponse["messageType"], text: "", detail: "" },
  open: false
});

const termOccurrences = ref<any[]>();
const content = ref("");
const definition = ref<string | null>(null);
const conceptIri = ref<string | null>(null);
const projectName = ref("");
const canEdit = ref(false);

const props = defineProps(['id', 'projectid'])

async function fetchTerm() {
  const response = await TermDataService.getAllForOneProject(props.projectid);
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    const match = response.data.find((t: TermT) => t.id === props.id);
    if (match) {
      content.value = match.content;
      definition.value = match.definition ?? null;
      conceptIri.value = match.conceptIri ?? null;
    }
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

async function fetchPermissions() {
  const response = await ProjectDataService.getOne(props.projectid);
  if (!("messageType" in response)) {
    projectName.value = response.data.name as string;
    const userId = store.getUser.id;
    const isEngineer = response.data.engineers.some((e: any) => e.id === userId);
    const isManager = response.data.managers.some((m: any) => m.id === userId);
    canEdit.value = isEngineer || isManager || store.getUser.isSystemAdmin;
  }
}

const groupedOccurrences = computed(() => {
  if (!termOccurrences.value) return [];
  const map = new Map<string, { groupId: string; groupName: string; questions: any[] }>();
  for (const cq of termOccurrences.value) {
    if (!map.has(cq.group.id)) {
      map.set(cq.group.id, { groupId: cq.group.id, groupName: cq.group.name, questions: [] });
    }
    map.get(cq.group.id)!.questions.push(cq);
  }
  return Array.from(map.values());
});

const uniqueGroupCount = computed(() => groupedOccurrences.value.length);

const saveConfirmDetail = computed(() => {
  if (!termOccurrences.value) return '';
  const qCount = termOccurrences.value.length;
  const gCount = uniqueGroupCount.value;
  if (qCount === 0) return 'This term is not currently referenced in any questions.';
  return `This will rename the term in ${qCount} competency question${qCount !== 1 ? 's' : ''} across ${gCount} group${gCount !== 1 ? 's' : ''}.`;
});

const deleteConfirmDetail = computed(() => {
  if (!termOccurrences.value) return '';
  const qCount = termOccurrences.value.length;
  if (qCount === 0) return 'This will permanently delete the term.';
  return `This will permanently delete the term and remove its annotations from ${qCount} question${qCount !== 1 ? 's' : ''}.`;
});

async function save() {
  const response = await TermDataService.update(props.projectid, props.id, content.value, definition.value || null, conceptIri.value || null);
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    messagePopupData.value.uxresponse = {
      title: "Saved",
      messageType: "success",
      text: "The term has been updated.",
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
fetchPermissions();
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>

  <div v-if="termOccurrences !== undefined" class="w-full">

    <!-- Header -->
    <DetailPageHeader :title="content" :project="projectName">
      <template #meta>
        <span class="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20">
          Term
        </span>
        <span v-if="termOccurrences.length > 0" class="ml-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ termOccurrences.length }} occurrence{{ termOccurrences.length !== 1 ? 's' : '' }}
          <template v-if="uniqueGroupCount > 0"> in {{ uniqueGroupCount }} group{{ uniqueGroupCount !== 1 ? 's' : '' }}</template>
        </span>
      </template>
    </DetailPageHeader>

    <p v-if="definition" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
      {{ definition }}
    </p>
    <a v-if="conceptIri && /^https?:\/\//i.test(conceptIri)" :href="conceptIri" target="_blank" rel="noopener noreferrer"
       class="mt-1 inline-block text-sm text-indigo-600 dark:text-indigo-400 underline break-all">
      {{ conceptIri }}
    </a>
    <p v-else-if="conceptIri" class="mt-1 text-sm text-gray-500 dark:text-gray-400 break-all">
      {{ conceptIri }}
    </p>

    <hr class="my-6 border-gray-200 dark:border-gray-700"/>

    <!-- Occurrences -->
    <h2 class="text-lg font-semibold dark:text-white mb-1">
      Occurrences
      <span class="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ termOccurrences.length }}</span>
    </h2>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      Competency questions in this project that reference this term.
    </p>

    <div v-if="termOccurrences.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
      This term is not used in any question yet.
    </div>

    <div v-for="group in groupedOccurrences" :key="group.groupId" class="mt-6">
      <h3 class="text-lg font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-300 mb-2">
        {{ group.groupName }}
      </h3>
      <CQListItem v-for="cq in group.questions" :key="cq.id" :cq="cq" />
    </div>

    <!-- Edit section — ontology engineers only -->
    <template v-if="canEdit">
      <hr class="my-8 border-gray-200 dark:border-gray-700"/>

      <h2 class="text-lg font-semibold dark:text-white mb-4">Edit Term</h2>

      <div class="mb-6">
        <label for="term-content" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          Term name
        </label>
        <input type="text" v-model="content" id="term-content"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
      </div>

      <div class="mb-6">
        <label for="term-definition" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          Definition <span class="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
        </label>
        <textarea v-model="definition" id="term-definition" rows="3"
                  placeholder="Human-readable definition of this term..."
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
      </div>

      <div class="mb-6">
        <label for="term-concept-iri" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          Concept IRI <span class="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
        </label>
        <input type="text" v-model="conceptIri" id="term-concept-iri"
               placeholder="https://example.org/ontology/Term"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
      </div>

      <div class="flex items-center justify-between">
        <SubmitButtonWithCallback
          agree-button-text="Delete term"
          title="Delete this term?"
          :detail="deleteConfirmDetail"
          @modalsuccessclose="deleteTerm">
          <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
          Delete
        </SubmitButtonWithCallback>

        <SubmitButtonWithCallback
          agree-button-text="Rename term"
          title="Rename this term?"
          :detail="saveConfirmDetail"
          @modalsuccessclose="save">
          <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
          Save
        </SubmitButtonWithCallback>
      </div>
    </template>
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
