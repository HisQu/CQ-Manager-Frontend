<script setup lang="ts">
import ConsolidationListItem from "../components/ConsolidationListItem.vue";
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/20/solid"
import {ref, watch} from "vue";
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
const cqMap = ref<Map<string, CompetencyQuestionReducedT>>(new Map());
const isOntologyEngineer = ref(false);

function showError(response: UXResponse) {
  messagePopupData.value.uxresponse = {...messagePopupData.value.uxresponse, ...response};
  messagePopupData.value.open = true;
}

async function fetchAll() {
  consolidations.value = undefined;
  cqMap.value = new Map();

  const [consoResponse, cqResponse] = await Promise.all([
    ConsolidationDataService.getAllForOneProject(getProject.value.id),
    CompetencyQuestionDataService.getAllForOneProject(getProject.value.id),
  ]);

  if ("messageType" in consoResponse) {
    showError(consoResponse);
  } else {
    consolidations.value = consoResponse.data;
    isOntologyEngineer.value = (consoResponse.data as any).permissionsProjectEngineer ?? false;
  }

  if ("messageType" in cqResponse) {
    showError(cqResponse);
  } else {
    cqMap.value = new Map(cqResponse.data.map((cq: CompetencyQuestionReducedT) => [cq.id, cq]));
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

    <div v-if="consolidations">
      <div v-if="consolidations.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        There are no consolidations yet.
      </div>
      <ConsolidationListItem v-for="cons in consolidations"
                             :key="cons.id"
                             :consolidation="cons"
                             :project-id="getProject.id"
                             :result-question="cons.resultQuestionId ? cqMap.get(cons.resultQuestionId) : undefined"
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
