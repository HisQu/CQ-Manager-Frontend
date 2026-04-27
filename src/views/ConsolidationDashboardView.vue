<script setup lang="ts">
import ConsolidationListItem from "../components/ConsolidationListItem.vue";
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
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
    messageType: "",
    text: "",
    detail: "",
  },
  open: false,
})

const consolidations = ref();
const isOntologyEngineer = ref(false);

function fetchProjects() {
  ConsolidationDataService.getAllForOneProject(getProject.value.id).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      consolidations.value = response;
      isOntologyEngineer.value = response.data.permissionsProjectEngineer

      console.log()
      console.log(consolidations.value.data)
    }
  });
}

fetchProjects()

watch(getProject, (_, __) => {
  fetchProjects()
})
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="w-full">
    <DetailPageHeader title="Consolidations" :project="getProject.name">
      <template v-if="isOntologyEngineer" #actions>
        <RouterLink to="/consolidations/add/" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Consolidate Questions
          <ArrowDownOnSquareIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </RouterLink>
      </template>
    </DetailPageHeader>
    <div v-if="consolidations">
      <div v-if="consolidations.data.length === 0" class="mt-10">
        There are no consolidations yet!
      </div>
      <ConsolidationListItem v-for="cons in consolidations.data" :is-ontology-engineer="isOntologyEngineer" :consolidation="cons" />
    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_" class="border-1 shadow rounded-md p-4 max-w-xl w-full mx-auto dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-10">
        <div class="animate-pulse flex space-x-4">
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-slate-500 rounded"></div>
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-slate-500 rounded col-span-2"></div>
                <div class="h-2 bg-slate-500 rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-slate-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>