<script setup lang="ts">
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import {ref, watch} from "vue";
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/vue";
import StarComponent from "../components/StarComponent.vue";
import CommentComponent from "../components/CommentComponent.vue";
import ConsolidationListItem from "../components/ConsolidationListItem.vue";
import CompetencyQuestionQueryBuilder from "../components/CompetencyQuestionQueryBuilder.vue";

const props = defineProps(['id', 'groupid'])

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
})

const timeoutDuration = 1000
const starsAreHovered = ref(false);
const timeout = ref();
const open = ref(false);
const cq = ref();
const stats = ref();
const canEdit = ref();

watch(starsAreHovered, (newValue, _) => {
  if (newValue) {
    clearTimeout(timeout.value);
    open.value = true;
  } else {
    timeout.value = setTimeout(() => {
      open.value = false;
    }, timeoutDuration);
  }
})

fetchCompetencyQuestion();

async function fetchCompetencyQuestion() {
  console.log("fetch")
  CompetencyQuestionDataService.getOne(props.id, props.groupid).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      cq.value = response;

      canEdit.value = response.data.permissionsGroupMember || response.data.permissionsProjectManager;
      console.log(canEdit.value)

      stats.value = [
        {name: "Author", value: cq.value.data.author.name},
        {name: "№ Cons.", value: cq.value.data.consolidations.length},
        {name: "Project", value: cq.value.data.group.project.name},
        {name: "Group", value: cq.value.data.group.name},
        {name: "Version", value: cq.value.data.versionNumber}
      ]

    }
  });
}

// the functionality of posting annotations to this endpoint seems to not be working
// as of now, so we will pass an empty array here
// TODO: change the empty brackets to annotations when this is ready.
function saveCompetencyQuestion(question: string) {
  CompetencyQuestionDataService.change(question, [], props.groupid, props.id).then(() => {
    fetchCompetencyQuestion()
  })
}

</script>

<template>
  <div v-if="cq && messagePopupData.open===false"
       class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>
    <h1 class="text-2xl">
      Competency Question Detail View
    </h1>

    <h3 class="text-xl mt-5">Project: {{cq.data.group.project.name}}</h3>

    <div>
      <div class="my-3">
        <div class="float-right">
          <span class="inline-block text-right ml-2"
                @mouseover="starsAreHovered = true"
                @mouseleave="starsAreHovered = false"> <!-- this hovering mechanism is WIP -->
                <StarComponent v-if="cq"
                               :rating="cq.data.aggregatedRating"
                               :question_id="cq.data.id"
                               @afterRating="fetchCompetencyQuestion();"/>
            <br>
            <Popover class="relative inline-block ml-6" v-slot="{open}">
              <PopoverButton>Show Ratings</PopoverButton>
              <div v-if="open">
                <transition enter-active-class="transition ease-out duration-200"
                            enter-from-class="opacity-0 translate-y-1"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition ease-in duration-150"
                            leave-from-class="opacity-100 translate-y-0"
                            leave-to-class="opacity-0 translate-y-1">
                  <PopoverPanel static
                                class="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
            <!-- TODO check what happens on overflow, with many cq ratings -->

                    <div
                        class="w-screen max-w-sm flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                      <div class="p-4">
                        <div
                            v-for="item in cq.data.ratings"
                            :key="item.id"
                            class="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50">
                          <span class="mr-5 w-1/2 text-ellipsis text-gray-600">{{ item.author.name }}</span>
                          <div class="-mt-1 inline w-1/2">
                            <StarComponent :rating="item.rating"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverPanel>
                </transition>
              </div>
            </Popover>
          </span>

        </div>
      </div>
      <div>

      </div>

      <div class="my-10">
        <CompetencyQuestionQueryBuilder @saveCompetencyQuestion="saveCompetencyQuestion"
                                        @fetchCompetencyQuestion="fetchCompetencyQuestion"
                                        :question="cq.data.question"
                                        :group-id="cq.data.groupId"
                                        :id="cq.data.id"
                                        :project-id="cq.data.group.project.id"
                                        :annotations="cq.data.annotations"
                                        :canEdit="canEdit" />
      </div>


      <div class="dark:bg-gray-900 bg-gray-100 mt-16 mb-10">
        <div class="mx-auto max-w-7xl">
          <div class="grid grid-cols-1 gap-px dark:bg-white/5 bg-gray-300/5 sm:grid-cols-2 lg:grid-cols-5">
            <div v-for="stat in stats" :key="stat.name" class="dark:bg-gray-700 px-4 py-6 sm:px-6 lg:px-8">
              <p class="text-sm font-medium leading-6 dark:text-gray-400">{{ stat.name }}</p>
              <p class="mt-2 flex items-baseline gap-x-2">
                <span class="text-xl font-semibold tracking-tight dark:text-white">{{ stat.value }}</span>
                <span v-if="stat.unit" class="text-sm dark:text-gray-400">{{ stat.unit }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 v-if="cq.data.consolidations" class="mt-12 text-xl">Consolidations <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ cq.data.consolidations.length }}</span></h3>
      <div>
        <ConsolidationListItem v-for="cons in cq.data.consolidations" :consolidation="cons" />
      </div>

      <h3 v-if="cq.data.versionNumber > 1" class="mt-10 text-xl">Versions</h3>
      <div>
        <p v-for="v in cq.data.versions"><span class="font-mono">{{ v.editor.name }}:</span> <span
            class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">version: {{
            v.versionNumber
          }}</span> {{ v.questionString }} </p>
      </div>

      <h3 class="mt-14 mb-5 text-xl">Recent Comments <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{{ cq.data.comments.length }}</span></h3>
      <CommentComponent :question-id="cq.data.id" :comments="cq.data.comments" @refresh="fetchCompetencyQuestion()"/>
    </div>


  </div>
  <div v-else class="w-full animate-pulse">
    <div class="grid grid-cols-2 gap-4">
      <div class="h-8 border-1 shadow rounded-md p-4 dark:bg-gray-700
                dark:text-gray-200 bg-gray-100"></div>
    </div>
    <StarComponent :rating="0" :ignore_zero_rating="true" class="float-right mt-4"/>
    <div class="h-80
                border-1 shadow rounded-md p-4 max-w-xl dark:bg-gray-700
                dark:text-gray-200 bg-gray-100 mt-16"></div>
  </div>
</template>

<!-- TODO deleting does not work -->

<style scoped>

</style>