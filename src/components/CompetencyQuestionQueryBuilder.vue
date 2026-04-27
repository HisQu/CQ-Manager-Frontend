<script setup lang="ts">
import {computed, defineProps, ref, toRefs} from "vue";
import {ArrowDownOnSquareIcon, CheckCircleIcon, TrashIcon, ChevronUpDownIcon, CheckIcon} from "@heroicons/vue/24/solid";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import SubmitButtonWithCallback from "./SubmitButtonWithCallback.vue";
import TermDataService from "../services/TermDataService.ts";
import MessagePopup from "./MessagePopup.vue";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot
} from "@headlessui/vue";

const addPassageInput = ref("");

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
})

const props = defineProps(['question', 'annotations', 'canEdit', 'groupId', 'id', 'projectId'])
const {annotations} = toRefs(props)
const emits = defineEmits(['saveCompetencyQuestion', 'fetchCompetencyQuestion'])

const terms = ref<TermT[]>();
const term = ref<TermT>()
const query = ref('')
const filteredTerms = computed(() =>
    terms.value === undefined ? [] :
        query.value === ''
            ? terms?.value
            : terms.value.filter((e) => {
              return e.content.toLowerCase().includes(query.value.toLowerCase())
            })
)

function insertTermPassagePair() {
  console.log(addPassageInput.value)
  TermDataService.add(props.id, [{
    term: term.value?.content,
    passage: addPassageInput.value
  }]).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      emits('fetchCompetencyQuestion');
      term.value = '';
      addPassageInput.value = '';
    }
  })
}

function fetchTerms() {
  TermDataService.getAllForOneProject(props.projectId).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;

    } else {
      terms.value = response.data;
    }
  })
}

fetchTerms()
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div>
    <label for="question"
           class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">Question</label>
    <div class="mt-2">
      <textarea name="question" id="question" rows="4"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
             v-model="props.question"
      ></textarea>
    </div>
    <h3 class="mt-10 mb-5 text-xl">Term Annotations</h3>
    <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 mb-5">
      This section allows you to add terms to a question. If a certain term does not exist yet, it will be created.
      Questions that contain the same terms can be found via the
      <RouterLink to="/terms" class="font-bold underline decoration-blue-500 decoration-2 dark:text-slate-200">Terms
      </RouterLink>
    </p>
    <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 mb-5">
      <span class="font-bold italic">What are terms and passages?</span>
      Below you can select a term (select an existing or add a new one) which should be associated to a certain passage
      or declined form of the term in the question. For example: the plural "pizzas" is the passage where the term "pizza"
      occurs.
    </p>

    <div v-for="element in annotations"
         class="items-center rounded-md my-4 px-2 py-1 mx-auto font-medium ring-1 ring-inset bg-gray-50 text-gray-600 ring-ray-500/10">
      Term:
      <RouterLink class="font-bold underline decoration-blue-500 decoration-2 text-blue-500"
                  :to="'/terms/'+props.projectId+'/'+element.term.id">
        {{ element.term.content }}
      </RouterLink>
      , Passage: {{ element.content }}
      <button type="button"
              v-if="props.canEdit"
              class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20 float-right"
              @click="TermDataService.remove(element.term.id, element.id, props.id).then(() => {$emit('fetchCompetencyQuestion')})">
        <span class="sr-only">Remove</span>
        <svg viewBox="0 0 14 14"
             class="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
          <path d="M4 4l6 6m0-6l-6 6"/>
        </svg>
        <span class="absolute -inset-1"/>
      </button>
    </div>
    <div class="flex mt-5" v-if="props.canEdit">
      <div class="grow mr-5">
        <label for="search" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
          Add term to question
        </label>
        <div class="relative mt-2 flex items-center">
          <Combobox v-model="term" class="w-5/6">
            <div class="relative mr-5">
              <div
                  class="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm"
              >
                <ComboboxInput
                    class="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    :displayValue="term?.content"
                    placeholder="Term"
                    @input="query = $event.target.value;"
                />
                <ComboboxButton
                    class="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  <ChevronUpDownIcon
                      class="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                  />
                </ComboboxButton>
              </div>
              <TransitionRoot
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  @after-leave="query = ''"
              >
                <ComboboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                >
                  <ComboboxOption
                      v-for="term in filteredTerms"
                      as="template"
                      :key="term.id"
                      :value="term"
                      v-slot="{ selected, active }"
                      @click="insertTermPassagePair()"
                  >
                    <li
                        class="relative cursor-default select-none py-2 pl-10 pr-4"
                        :class="{
                  'bg-indigo-600 text-white': active,
                  'text-gray-900': !active,
                }"
                    >
                <span
                    class="block truncate"
                    :class="{ 'font-medium': selected, 'font-normal': !selected }"
                >
                  {{ term.content }}
                </span>
                      <span
                          v-if="selected"
                          class="absolute inset-y-0 left-0 flex items-center pl-3"
                          :class="{ 'text-white': active, 'text-indigo-600': !active }"
                      >
                  <CheckIcon class="h-5 w-5" aria-hidden="true"/>
                </span>
                    </li>
                  </ComboboxOption>
                  <ComboboxOption :value="{content: query}">
                    <li
                        class="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900"
                        @click="insertTermPassagePair()"
                    >
                      Create term "{{ query }}"
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </TransitionRoot>
            </div>
          </Combobox>
          <input type="text" ref="passage"
                 placeholder="Passage"
                 v-model="addPassageInput"
                 @keyup.enter="insertTermPassagePair();"
                 class="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          <div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <kbd class="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
              ↵ ENTER
            </kbd>
          </div>
        </div>
      </div>
      <div class="mt-auto">
        <button type="button"
                @click="insertTermPassagePair();"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <CheckCircleIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
        </button>
      </div>
    </div>
  </div>
  <div v-if="canEdit" class="mt-5 flex flex-row-reverse">
    <button
        @click="$emit('saveCompetencyQuestion', props.question)"
        type="button"
        class="float-right inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
      Save
    </button>
    <div class="mr-5" v-if="$props.id && $props.groupId">
      <SubmitButtonWithCallback agree-button-text="Delete the question"
                                title="Are you sure you want to delete the question?"
                                detail="This action is permanent. All comments, ratings and consolidations will be deleted."
                                @modalsuccessclose="CompetencyQuestionDataService.delete(props.id, props.groupId); $router.push('/questions/');">
        <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
        Delete
      </SubmitButtonWithCallback>
    </div>
  </div>
</template>

<style scoped>

</style>
