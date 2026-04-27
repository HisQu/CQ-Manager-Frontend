<script setup lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ref, watch} from "vue";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";
import TermDataService from "../services/TermDataService.ts";
import TermListItem from "../components/TermListItem.vue";

const useStore1 = useStore()
const {getProject} = storeToRefs(useStore1)

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
})

const terms = ref();

async function fetchTerms() {

  if (!getProject.value.id) {
    messagePopupData.value.uxresponse = {
      title: "No project selected",
      messageType: "warning",
      text: "Please select a project in the navigation bar on the left first.",
      detail: ""
    };
    messagePopupData.value.open = true;
  } else {
    TermDataService.getAllForOneProject(getProject.value.id).then(response => {
      if ("messageType" in response) {
        messagePopupData.value.uxresponse = {
          ...messagePopupData.value.uxresponse,
          ...response
        };
        messagePopupData.value.open = true;

      } else {
        terms.value = response;
        console.log()
        console.log(terms.value.data)
      }
    });
  }
}

fetchTerms()

watch(getProject, (_, __) => {
  fetchTerms()
})
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="w-full">
    <DetailPageHeader title="Terms" :project="getProject.name">
      <template #meta>
        <span class="text-gray-500 dark:text-gray-400">New terms can be added via a Competency Question detail view.</span>
      </template>
    </DetailPageHeader>

    <div v-if="terms">
      <div v-if="terms.data.length === 0" class="mt-10">
        There are no terms yet!
      </div>

      <div class="mt-10" v-for="term in terms.data">
        <TermListItem :term="term"/>
      </div>

    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_"
           class="border-1 shadow rounded-md p-4 max-w-xl w-full mx-auto dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-10">
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