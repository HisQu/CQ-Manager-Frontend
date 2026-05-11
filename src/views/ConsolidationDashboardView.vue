<script setup lang="ts">
import ConsolidationListItem from "../components/ConsolidationListItem.vue";
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ArrowDownOnSquareIcon, MagnifyingGlassIcon} from "@heroicons/vue/20/solid"
import {ref, computed, watch} from "vue";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";

const useStore1 = useStore()
const {getProject} = storeToRefs(useStore1)

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false,
})

const consolidations = ref<ConsolidationReducedT[]>();
const isOntologyEngineer = ref(false);
const searchQuery = ref('');

function matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = fields.filter(Boolean).join(' ').toLowerCase();
  return q.split(/\s+/).every(word => text.includes(word));
}

const displayedConsolidations = computed(() => {
  if (!consolidations.value) return undefined;
  const q = searchQuery.value;
  if (!q.trim()) return consolidations.value;
  return consolidations.value.filter(c =>
    matchesSearch(q, c.resultQuestion?.question, c.resultQuestion?.comment)
  );
})

function showError(response: UXResponse) {
  messagePopupData.value.uxresponse = {...messagePopupData.value.uxresponse, ...response};
  messagePopupData.value.open = true;
}

async function fetchAll() {
  consolidations.value = undefined;

  const response = await ConsolidationDataService.getAllForOneProject(getProject.value.id);

  if ("messageType" in response) {
    showError(response);
  } else {
    consolidations.value = response.data;
    isOntologyEngineer.value = (response.data as any).permissionsProjectEngineer ?? false;
  }
}

fetchAll()

watch(getProject, () => fetchAll())
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="w-full">
    <DetailPageHeader title="Consolidations" :project="getProject.name">
      <template v-if="isOntologyEngineer" #actions>
        <RouterLink to="/consolidations/add/"
                    class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Consolidate Questions
          <ArrowDownOnSquareIcon class="-mr-0.5 h-5 w-5" aria-hidden="true"/>
        </RouterLink>
      </template>
    </DetailPageHeader>

    <!-- Search -->
    <div class="mt-5 max-w-sm">
      <div class="relative">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <input v-model="searchQuery"
               type="text"
               placeholder="Search consolidations..."
               class="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6" />
      </div>
    </div>

    <div v-if="consolidations">
      <div v-if="displayedConsolidations && displayedConsolidations.length === 0"
           class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery.trim() ? 'No consolidations match your search.' : 'There are no consolidations yet.' }}
      </div>
      <ConsolidationListItem v-for="cons in displayedConsolidations"
                             :key="cons.id"
                             :consolidation="cons"
                             :project-id="getProject.id"
                             :result-question="cons.resultQuestion ?? undefined"
                             :is-ontology-engineer="isOntologyEngineer"
                             @deleted="fetchAll"/>
    </div>

    <div v-else>
      <div v-for="_ in 4" :key="_"
           class="border-1 shadow rounded-lg p-4 max-w-xl w-full dark:bg-gray-700 bg-gray-100 mt-4">
        <div class="animate-pulse space-y-3">
          <div class="h-3 bg-slate-400 dark:bg-slate-500 rounded w-3/4"></div>
          <div class="h-2 bg-slate-300 dark:bg-slate-600 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
