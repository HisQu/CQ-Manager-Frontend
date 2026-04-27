<script lang="ts">
import {defineComponent} from 'vue'
import MessagePopup from "../components/MessagePopup.vue";
import { ExclamationCircleIcon } from '@heroicons/vue/20/solid'
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import QuestionSelectorComponent from "../components/QuestionSelectorComponent.vue";
import {useStore} from "../store.ts";

export default defineComponent({
  name: "ConsolidationCreateView",
  components: {QuestionSelectorComponent, MessagePopup, ExclamationCircleIcon},
  data() {
    return {
      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "" as UXResponse["messageType"],
          text: "",
          detail: "",
        },
        open: false,
      },

      store: useStore(),

      groups: [
        {name: "Gruppe 1", uuid: "3"},
        {name: "Gruppe 2", uuid: "100"}
      ],

      cqs: [] as CompetencyQuestionReducedT[],
      consolidationName: "",
      selectedQuestions: [] as string[],

      nameError: false,

    }
  },
  mounted() {
    this.getCompetencyQuestions()
  },



  methods: {
    async getCompetencyQuestions()  {
      const response = await CompetencyQuestionDataService.getAllForOneProject(this.store.project.id);
      console.log(response)

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        // successful
        this.cqs = response.data;
        console.log(this.cqs)
      }
    },

    storeSelection(selectedQuestions: string[]) {
      this.selectedQuestions = selectedQuestions;
      this.save()
    },

    async save() {
      if (this.consolidationName.length < 1) {
        this.nameError = true;
        setTimeout(() => this.nameError = false, 10000)
        return;
      }

      const response = await ConsolidationDataService.add(this.consolidationName, this.store.project.id, this.selectedQuestions);

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        // successful
        this.$router.push('/consolidations/');
      }
    }
  }
})
</script>

<template>
  <div class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>
    <h1 class="text-2xl">
      Consolidate Questions
    </h1>

    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 mb-5">
            This view allows to consolidate question into one new
            question. Select the questions you want to consolidate in the table below, enter a name in the input field
            and click "Consolidate".
          </p>
        </div>
      </div>

      <div>
        <label for="cq" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Consolidated Question</label>
        <div class="relative mt-2 rounded-md shadow-sm">
          <input type="text" v-model="consolidationName" class="block w-full rounded-md border-0 py-1.5 pr-10 text-red-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" :class="nameError ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500' : ''" aria-invalid="true" aria-describedby="cq-error" />
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon v-if="nameError" class="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        </div>
        <p class="mt-2 text-sm text-red-600" id="cq-error" v-if="nameError">Please enter a name.</p>
      </div>

      <div class="mt-5">
        <label for="cq" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Project (Because it is selected in the navbar)</label>
        <RouterLink :to="'/projects/'+store.project.id" class="font-bold underline decoration-blue-500 decoration-2 dark:text-slate-200">
          {{store.project.name}}
        </RouterLink>
      </div>

      <QuestionSelectorComponent :cqs="cqs" @selection-was-made="storeSelection">
        Consolidate
      </QuestionSelectorComponent>
    </div>

  </div>
</template>

<style scoped>

</style>