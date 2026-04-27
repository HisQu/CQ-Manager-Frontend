<script lang="ts" setup>
import {ref} from "vue";
import MessagePopup from "../components/MessagePopup.vue";
import TermDataService from "../services/TermDataService.ts";
import CompetencyQuestionListItem from "../components/CompetencyQuestionListItem.vue";

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
});

const termOccurences = ref();
const term = ref();

const props = defineProps(['id', 'projectid'])

function fetchTermOccurences() {
  TermDataService.getQuestionsThatThisTermOccursIn(props.projectid, props.id).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      termOccurences.value = response;
    }
  })
}

function fetchTermInfo() {
  TermDataService.getAllForOneProject(props.projectid).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      term.value = response.data.filter(t => t.id === props.id)
      if (term.value.length > 0) {
        term.value = term.value[0]
      }
    }
  })
}

fetchTermInfo();
fetchTermOccurences();

</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div v-if="termOccurences"
       class="w-full">

    <h1 class="text-2xl">
      Term <span class="font-bold italic">{{ term.content }}</span> occurs in <span class="font-bold italic">{{termOccurences.data.length}}</span> question(s):
    </h1>

    <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 mb-5">
      This view allows you to view the occurrences of a term within other questions.
      A term can only be used <span class="font-bold italic">project-wide</span>.
    </p>

    <div v-for="cq in termOccurences.data" class="flex items-center mt-5">
      <div class="bg-gray-200 dark:bg-gray-700 p-4 rounded w-full mr-3">
        <CompetencyQuestionListItem class="max-w-xl"
                                    :text="cq.question"
                                    :groupIdentifier="cq.group.id"
                                    :identifier="cq.id"/>
      </div>
    </div>

  </div>
</template>

<style scoped>

</style>