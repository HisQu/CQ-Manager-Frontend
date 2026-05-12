<script setup lang="ts">
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import TopicDataService from "../services/TopicDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {ref} from "vue";
import {Listbox, ListboxButton, ListboxOption, ListboxOptions, Popover, PopoverButton, PopoverPanel} from "@headlessui/vue";
import {CheckIcon, ChevronUpDownIcon} from "@heroicons/vue/20/solid";
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
const comment = ref<string | null>(null);

const topics = ref<TopicT[]>([]);
const NO_TOPIC = { id: '', identifier: '', name: 'None (remove from catalogue)' } as TopicReducedT & { id: string };
const selectedTopic = ref<TopicReducedT | null>(null);

fetchCompetencyQuestion();

async function fetchCompetencyQuestion() {
  CompetencyQuestionDataService.getOne(props.id, props.groupid).then(async response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
      messagePopupData.value.open = true;
    } else {
      cq.value = response;
      comment.value = response.data.comment ?? null;
      canEdit.value = response.data.permissionsGroupMember || response.data.permissionsProjectManager;
      await fetchTopics(response.data.group.project.id);
      selectedTopic.value = response.data.topic ?? null;
    }
  });
}

async function fetchTopics(projectId: string) {
  const response = await TopicDataService.getAllForProject(projectId);
  if (!('messageType' in response)) {
    topics.value = response.data;
  }
}

async function saveCatalogueAssignment() {
  const projectId = cq.value.data.group.project.id;
  const questionId = cq.value.data.id;
  const hasTopic = !!cq.value.data.topic;

  let response;
  if (!selectedTopic.value || selectedTopic.value.id === '') {
    if (!hasTopic) return;
    response = await TopicDataService.removeQuestion(projectId, questionId);
  } else if (hasTopic) {
    response = await TopicDataService.changeQuestion(projectId, selectedTopic.value.id, questionId);
  } else {
    response = await TopicDataService.assignQuestion(projectId, selectedTopic.value.id, questionId);
  }

  if ('messageType' in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    await fetchCompetencyQuestion();
  }
}

function saveCompetencyQuestion({ question, sparqlQuery, comment: newComment, reference, anchor, exampleAnswer, type }: { question: string, sparqlQuery: string | null, comment: string | null, reference?: string | null, anchor?: string | null, exampleAnswer?: string | null, type?: CQType | null }) {
  comment.value = newComment;
  CompetencyQuestionDataService.change(question, [], props.groupid, props.id, sparqlQuery, newComment, { reference, anchor, exampleAnswer, type }).then(() => {
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
      :title="cq.data.question"
      :project="cq.data.group.project.name"
      :group="cq.data.group.name"
      :catalogue-identifier="cq.data.cqCatalogueIdentifier ?? undefined"
      :catalogue-name="cq.data.topic?.name">
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

    <!-- Catalogue assignment -->
    <div class="mb-8">
      <h2 class="text-base font-semibold dark:text-white mb-3">Catalogue</h2>

      <!-- Current assignment badge -->
      <div v-if="cq.data.topic" class="flex items-center gap-2 mb-3">
        <span class="inline-flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-400/20 px-2.5 py-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
          {{ cq.data.topic.identifier }}
        </span>
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ cq.data.topic.name }}</span>
      </div>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-3">Not assigned to a catalogue.</p>

      <!-- Reassignment controls (only when editable) -->
      <div v-if="canEdit" class="flex items-center gap-3 flex-wrap">
        <Listbox v-model="selectedTopic" class="min-w-56 flex-1 max-w-sm">
          <div class="relative">
            <ListboxButton class="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span class="flex items-center gap-1.5 truncate">
                <span v-if="selectedTopic?.identifier" class="font-semibold text-indigo-600 dark:text-indigo-400">{{ selectedTopic.identifier }}</span>
                <span>{{ selectedTopic?.name ?? 'Select a catalogue…' }}</span>
              </span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
                <ListboxOption v-if="cq.data.topic" as="template" :value="NO_TOPIC" v-slot="{ active, selected }">
                  <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400', 'relative cursor-default select-none py-2 pl-3 pr-9 italic']">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">Remove from catalogue</span>
                    <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
                <ListboxOption as="template" v-for="t in topics" :key="t.id" :value="t" v-slot="{ active, selected }">
                  <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate flex items-center gap-1.5']">
                      <span class="font-bold">{{ t.identifier }}</span>{{ t.name }}
                    </span>
                    <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>

        <button
          type="button"
          :disabled="selectedTopic?.id === (cq.data.topic?.id ?? '')"
          :class="[
            'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            selectedTopic?.id === (cq.data.topic?.id ?? '')
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
          ]"
          @click="saveCatalogueAssignment"
        >
          {{ !cq.data.topic ? 'Assign' : (selectedTopic?.id === '' ? 'Remove' : 'Change') }}
        </button>
      </div>
    </div>

    <!-- Question editor + term annotations -->
    <CompetencyQuestionQueryBuilder @saveCompetencyQuestion="saveCompetencyQuestion"
                                    @fetchCompetencyQuestion="fetchCompetencyQuestion"
                                    :question="cq.data.question"
                                    :sparql-query="cq.data.sparqlQuery"
                                    :comment="comment"
                                    :reference="cq.data.reference"
                                    :anchor="cq.data.anchor"
                                    :example-answer="cq.data.exampleAnswer"
                                    :type="cq.data.type"
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
      <ConsolidationListItem v-for="cons in cq.data.consolidations"
                             :key="cons.id"
                             :consolidation="cons"
                             :result-question="cons.resultQuestion"
                             :project-id="cons.project?.id ?? cq.data.group.project.id"/>
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
