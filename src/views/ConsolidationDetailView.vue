<script setup lang="ts">
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ref, watch} from "vue";
import {TrashIcon, ArrowDownOnSquareIcon, XMarkIcon} from "@heroicons/vue/24/solid";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import CompetencyQuestionListItem from "../components/CompetencyQuestionListItem.vue";
import QuestionSelectorComponent from "../components/QuestionSelectorComponent.vue";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";

const props = defineProps(['id', 'projectid'])

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
})

console.log("props")
console.log(props)

const timeoutDuration = 1000
const starsAreHovered = ref(false);
const timeout = ref();
const open = ref(false);
const consolidation = ref();
const cqs = ref();
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

fetchConsolidation();

async function fetchConsolidation() {
  ConsolidationDataService.getOne(props.id, props.projectid).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      consolidation.value = response;
      canEdit.value = response.data.permissionsProjectEngineer;
      console.log(consolidation.value.data)
    }
  });
}

CompetencyQuestionDataService.getAllForOneProject(props.projectid).then(response => {
  if ("messageType" in response) {
    messagePopupData.value.uxresponse = {
      ...messagePopupData.value.uxresponse,
      ...response
    };
    messagePopupData.value.open = true;

  } else {
    cqs.value = response;
    console.log()
    console.log(cqs.value.data)
  }
});

async function addQuestions(consolidationId: string, project_uuid: string, questionsIds: string[]) {
  ConsolidationDataService.addQuestions(consolidationId, project_uuid, questionsIds).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;
    } else {
      consolidation.value = response;
      console.log(consolidation.value.data)
    }
  });
}

async function removeQuestions(consolidationId: string, project_uuid: string, questionIds: string[]) {
  ConsolidationDataService.removeQuestions(consolidationId, project_uuid, questionIds).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      consolidation.value = response;
      console.log(consolidation.value.data)
    }
  });
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div v-if="consolidation"
       class="w-full">
    <DetailPageHeader :title="consolidation.data.name" :project="consolidation.data.project.name">
      <template #meta>
        By <span class="font-medium text-gray-700 dark:text-gray-200">{{ consolidation.data.engineer.name }}</span>
        <span v-if="consolidation.data.questions.length > 0" class="ml-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ consolidation.data.questions.length }} question{{ consolidation.data.questions.length !== 1 ? 's' : '' }}
        </span>
      </template>
    </DetailPageHeader>

    <div>
      <div class="mt-10">
        <label for="question">Question</label>
        <input type="text" name="question" id="question"
               placeholder="No question given"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
               :value="consolidation.data.name"
        />
      </div>

      <div v-if="canEdit" class="mt-5 flex flex-row-reverse">
        <button type="button"
                class="float-right inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
          Save
        </button>
        <div class="mr-5">
          <SubmitButtonWithCallback agree-button-text="Delete"
                                    title="Are you sure you want to delete this consolidation?"
                                    detail="This action is permanent. However, the consolidated questions are not deleted."
                                    @modalsuccessclose="ConsolidationDataService.delete(consolidation.data.id, consolidation.data.project.id); $router.push('/consolidations/');">
            <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
            Delete
          </SubmitButtonWithCallback>
        </div>
      </div>

      <div class="mt-10">
        <span class="text-xl">Associated Questions</span>
        <div v-for="cq in consolidation.data.questions" class="flex items-center mt-5">
          <div class="bg-gray-200 dark:bg-gray-700 p-4 rounded w-full mr-3">
            <CompetencyQuestionListItem class="max-w-xl"
                                        :text="cq.question"
                                        :groupIdentifier="cq.group.id"
                                        :identifier="cq.id"/>
          </div>
          <div v-if="canEdit" class="mx-auto">
            <button @click="removeQuestions(consolidation.data.id, consolidation.data.project.id, [cq.id])"
                    class="hover:dark:bg-gray-700 hover:bg-gray-100 hover:text-red-400 p-2 rounded">
              <XMarkIcon class="h-10 w-10"/>
            </button>
          </div>
        </div>

        <div v-if="canEdit" class="mt-10">
          <span class="text-xl">Add other CQs</span>
          <p v-if="cqs">Of {{cqs.data.length}} competency questions, there is {{ cqs.data.filter(_cq => !consolidation.data.questions.map(c => c.id).includes(_cq.id)).length }} (also displayed below) that is/are not yet consolidated in this CQ.</p>
          <QuestionSelectorComponent v-if="cqs && consolidation.data" :cqs="cqs.data.filter(_cq => !consolidation.data.questions.map(c => c.id).includes(_cq.id))" @selection-was-made="(ids) => {addQuestions(consolidation.data.id, consolidation.data.project.id, ids)}">
            Add to existing CQ
          </QuestionSelectorComponent>
          <h3 v-else>
            No questions to select.
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>