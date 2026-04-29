<script lang="ts">
import {defineComponent} from 'vue'
import MessagePopup from "../components/MessagePopup.vue";
import {ExclamationCircleIcon, CheckIcon, ChevronUpDownIcon, ArrowDownOnSquareIcon} from '@heroicons/vue/20/solid'
import ConsolidationDataService from "../services/ConsolidationDataService.ts";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {useStore} from "../store.ts";
import QuestionSelectorTable from "../components/QuestionSelectorTable.vue";

export default defineComponent({
  name: "ConsolidationCreateView",
  components: {
    MessagePopup, ExclamationCircleIcon, ArrowDownOnSquareIcon,
    Listbox, ListboxButton, ListboxOption, ListboxOptions, CheckIcon, ChevronUpDownIcon,
    QuestionSelectorTable,
  },
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
      cqs: [] as CompetencyQuestionReducedT[],
      selectedQuestions: [] as string[],
      useExistingCq: false,
      newQuestionText: "",
      selectedResultCq: null as CompetencyQuestionReducedT | null,
      resultQuestionError: false,
      saving: false,
    }
  },
  mounted() {
    this.getCompetencyQuestions()
  },
  computed: {
    sourceCqs(): CompetencyQuestionReducedT[] {
      const excludedId = this.useExistingCq ? this.selectedResultCq?.id : null;
      return this.cqs.filter(cq => cq.id !== excludedId);
    },
  },
  methods: {
    async getCompetencyQuestions() {
      const response = await CompetencyQuestionDataService.getAllForOneProject(this.store.project.id);
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {...this.messagePopupData.uxresponse, ...response};
        this.messagePopupData.open = true;
      } else {
        this.cqs = response.data;
      }
    },

    async save() {
      const isValid = this.useExistingCq
        ? !!this.selectedResultCq
        : this.newQuestionText.trim().length > 0;

      if (!isValid) {
        this.resultQuestionError = true;
        setTimeout(() => this.resultQuestionError = false, 10000);
        return;
      }

      const resultQuestion = this.useExistingCq
        ? {id: this.selectedResultCq!.id}
        : {question: this.newQuestionText.trim()};

      this.saving = true;
      const response = await ConsolidationDataService.add(
        this.store.project.id,
        resultQuestion,
        this.selectedQuestions,
      );
      this.saving = false;

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {...this.messagePopupData.uxresponse, ...response};
        this.messagePopupData.open = true;
      } else {
        this.$router.push('/consolidations/');
      }
    }
  }
})
</script>

<template>
  <div class="w-full max-w-4xl">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>

    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Create Consolidation</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Combine multiple competency questions into one result question for
      <RouterLink :to="'/projects/' + store.project.id"
                  class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
        {{ store.project.name }}
      </RouterLink>.
    </p>

    <div class="mt-8 space-y-8">

      <!-- Step 1: Source Questions -->
      <QuestionSelectorTable :cqs="sourceCqs" @selectionChanged="selectedQuestions = $event">
        <template #header>
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Source Questions</h2>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Select the questions to consolidate.
            <span class="dark:text-blue-300 text-blue-600">Blue</span> rows are already part of another consolidation.
          </p>
        </template>
      </QuestionSelectorTable>

      <!-- Step 2: Result Question -->
      <div class="rounded-lg ring-1 ring-gray-200 dark:ring-gray-700"
           :class="resultQuestionError ? 'ring-red-300 dark:ring-red-500' : ''">
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Result Question</h2>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                The consolidated question that will represent the selected sources.
              </p>
            </div>
            <span class="flex rounded-md ring-1 ring-inset ring-gray-300 dark:ring-gray-600 overflow-hidden text-xs select-none">
              <button @click="useExistingCq = false"
                      :class="['px-3 py-1.5 font-medium transition-colors', !useExistingCq
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700']">
                New
              </button>
              <button @click="useExistingCq = true"
                      :class="['px-3 py-1.5 font-medium transition-colors', useExistingCq
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700']">
                Existing CQ
              </button>
            </span>
          </div>
        </div>

        <div class="px-5 py-4">
          <div v-if="!useExistingCq" class="relative">
            <input type="text" v-model="newQuestionText"
                   placeholder="Enter the consolidated question text..."
                   class="block w-full rounded-md border-0 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset"
                   :class="resultQuestionError
                     ? 'ring-red-300 focus:ring-red-500'
                     : 'ring-gray-300 dark:ring-gray-600 focus:ring-indigo-600'"/>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon v-if="resultQuestionError" class="h-4 w-4 text-red-500" aria-hidden="true"/>
            </div>
          </div>

          <Listbox v-else v-model="selectedResultCq">
            <div class="relative">
              <ListboxButton
                class="relative w-full cursor-default rounded-md py-2 pl-3 pr-10 text-left text-sm shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-inset dark:bg-gray-800"
                :class="resultQuestionError
                  ? 'ring-red-300 focus:ring-red-500 text-gray-900 dark:text-gray-100'
                  : 'ring-gray-300 dark:ring-gray-600 focus:ring-indigo-600 text-gray-900 dark:text-gray-100'">
                <span :class="['block truncate', selectedResultCq ? '' : 'text-gray-400']">
                  {{ selectedResultCq ? selectedResultCq.question : 'Select an existing CQ...' }}
                </span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon class="h-4 w-4 text-gray-400" aria-hidden="true"/>
                </span>
              </ListboxButton>
              <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none">
                  <ListboxOption as="template" v-for="cq in cqs" :key="cq.id" :value="cq" v-slot="{ active, selected }">
                    <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                      <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ cq.question }}</span>
                      <span :class="[active ? 'text-indigo-200' : 'text-gray-400', 'block text-xs truncate']">{{ cq.group?.name }}</span>
                      <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-3']">
                        <CheckIcon class="h-4 w-4" aria-hidden="true"/>
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>

          <p v-if="resultQuestionError" class="mt-2 text-xs text-red-600 dark:text-red-400">
            {{ useExistingCq ? 'Please select a CQ.' : 'Please enter a question.' }}
          </p>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex items-center justify-between pt-2 pb-8">
        <RouterLink to="/consolidations/"
                    class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          Cancel
        </RouterLink>
        <button type="button"
                @click="save"
                :disabled="saving"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed">
          <ArrowDownOnSquareIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
          {{ saving ? 'Creating...' : 'Create Consolidation' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
</style>
