<script setup lang="ts">
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ref} from "vue";
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/vue";
import StarComponent from "../components/StarComponent.vue";
import CommentComponent from "../components/CommentComponent.vue";
import ConsolidationListItem from "../components/ConsolidationListItem.vue";
import CompetencyQuestionQueryBuilder from "../components/CompetencyQuestionQueryBuilder.vue";

const props = defineProps(['id', 'groupid'])

const messagePopupData = ref({
  uxresponse: { title: "", messageType: "" as UXResponse["messageType"], text: "", detail: "" },
  open: false
})

const cq = ref();
const canEdit = ref();

fetchCompetencyQuestion();

async function fetchCompetencyQuestion() {
  CompetencyQuestionDataService.getOne(props.id, props.groupid).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
      messagePopupData.value.open = true;
    } else {
      cq.value = response;
      canEdit.value = response.data.permissionsGroupMember || response.data.permissionsProjectManager;
    }
  });
}

function saveCompetencyQuestion(question: string, sparqlQuery: string | null) {
  CompetencyQuestionDataService.change(question, [], props.groupid, props.id, sparqlQuery).then(() => {
    fetchCompetencyQuestion()
  })
}
</script>

<template>
  <div v-if="cq && !messagePopupData.open" class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>

    <!-- Header -->
    <DetailPageHeader
      title="Competency Question"
      :project="cq.data.group.project.name"
      :group="cq.data.group.name">
      <template #meta>
        By <span class="font-medium text-gray-700 dark:text-gray-200">{{ cq.data.author.name }}</span>
        <span class="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
        <span class="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          v{{ cq.data.versionNumber }}
        </span>
        <span v-if="cq.data.consolidations.length > 0" class="ml-1.5 inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/30">
          {{ cq.data.consolidations.length }} consolidation{{ cq.data.consolidations.length !== 1 ? 's' : '' }}
        </span>
      </template>
      <template #actions>
        <StarComponent :rating="cq.data.aggregatedRating"
                       :question_id="cq.data.id"
                       :version="cq.data.versions?.versionNumber"
                       @afterRating="fetchCompetencyQuestion()"/>
        <Popover class="relative">
          <PopoverButton class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 focus:outline-none">
            Show ratings
          </PopoverButton>
          <transition enter-active-class="transition ease-out duration-200"
                      enter-from-class="opacity-0 translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition ease-in duration-150"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 translate-y-1">
            <PopoverPanel class="absolute right-0 z-20 mt-2 w-72 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-900/10 dark:ring-white/10">
              <div class="p-3">
                <p v-if="cq.data.ratings.length === 0"
                   class="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">No ratings yet.</p>
                <div v-for="item in cq.data.ratings" :key="item.id"
                     class="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span class="text-sm text-gray-600 dark:text-gray-300 truncate mr-4">{{ item.author.name }}</span>
                  <StarComponent :rating="item.rating"/>
                </div>
              </div>
            </PopoverPanel>
          </transition>
        </Popover>
      </template>
    </DetailPageHeader>

    <hr class="my-6 border-gray-200 dark:border-gray-700"/>

    <!-- Question editor + term annotations -->
    <CompetencyQuestionQueryBuilder @saveCompetencyQuestion="saveCompetencyQuestion"
                                    @fetchCompetencyQuestion="fetchCompetencyQuestion"
                                    :question="cq.data.question"
                                    :sparql-query="cq.data.sparqlQuery"
                                    :group-id="cq.data.groupId"
                                    :id="cq.data.id"
                                    :project-id="cq.data.group.project.id"
                                    :annotations="cq.data.annotations"
                                    :canEdit="canEdit"/>

    <!-- Consolidations -->
    <template v-if="cq.data.consolidations.length > 0">
      <h2 class="mt-12 mb-3 text-lg font-semibold dark:text-white">
        Consolidations
        <span class="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ cq.data.consolidations.length }}</span>
      </h2>
      <ConsolidationListItem v-for="cons in cq.data.consolidations" :consolidation="cons"/>
    </template>

    <!-- Version history -->
    <template v-if="cq.data.versionNumber > 1">
      <h2 class="mt-10 mb-3 text-lg font-semibold dark:text-white">Version history</h2>
      <div class="space-y-2">
        <p v-for="v in cq.data.versions" class="text-sm dark:text-gray-300">
          <span class="font-medium">{{ v.editor.name }}</span>
          <span class="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">v{{ v.versionNumber }}</span>
          <span class="ml-2 text-gray-600 dark:text-gray-400">{{ v.questionString }}</span>
        </p>
      </div>
    </template>

    <!-- Comments -->
    <h2 class="mt-12 mb-3 text-lg font-semibold dark:text-white">
      Comments
      <span class="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ cq.data.comments.length }}</span>
    </h2>
    <CommentComponent :question-id="cq.data.id" :comments="cq.data.comments" @refresh="fetchCompetencyQuestion()"/>
  </div>

  <!-- Loading skeleton -->
  <div v-else class="w-full animate-pulse space-y-4">
    <div class="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div class="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
    <div class="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
    <div class="h-px w-full bg-gray-200 dark:bg-gray-700 mt-6"></div>
    <div class="h-28 w-full bg-gray-200 dark:bg-gray-700 rounded-md mt-4"></div>
  </div>
</template>

<style scoped>
</style>
