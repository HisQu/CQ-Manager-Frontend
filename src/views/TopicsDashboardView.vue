<script setup lang="ts">
import TopicListItem from "../components/TopicListItem.vue";
import TopicDataService from "../services/TopicDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import { PlusIcon } from "@heroicons/vue/20/solid";
import { ref, watch } from "vue";
import { useStore } from "../store.ts";
import { storeToRefs } from "pinia";

const useStore1 = useStore();
const { getProject } = storeToRefs(useStore1);

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false,
});

const topics = ref<{ data: TopicT[] } | null>(null);

async function fetchTopics() {
  if (!getProject.value.id) {
    messagePopupData.value.uxresponse = {
      title: "No project selected",
      messageType: "warning",
      text: "Please select a project in the navigation bar on the left first.",
      detail: "",
    };
    messagePopupData.value.open = true;
    return;
  }
  const response = await TopicDataService.getAllForProject(getProject.value.id);
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    topics.value = response;
  }
}

fetchTopics();

watch(getProject, () => fetchTopics());
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;" />
  <div class="w-full">
    <DetailPageHeader title="Catalogues" :project="getProject.name">
      <template #actions>
        <RouterLink to="/catalogues/add"
                    class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Add
          <PlusIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </RouterLink>
      </template>
    </DetailPageHeader>

    <div v-if="topics">
      <div v-if="topics.data.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        There are no catalogues yet!
      </div>
      <TopicListItem v-for="topic in topics.data" :key="topic.id" :topic="topic" />
    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_"
           class="border-1 shadow rounded-lg p-4 max-w-xl w-full dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4">
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
