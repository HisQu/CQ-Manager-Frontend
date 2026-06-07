<script setup lang="ts">
import CQListItem from "../components/CQListItem.vue";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import TopicDataService from "../services/TopicDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {PlusIcon, ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon, ArrowDownOnSquareIcon} from "@heroicons/vue/20/solid"
import {ref, computed, watch} from "vue";
import GroupDataService from "../services/GroupDataService.ts";
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, Switch, SwitchGroup, SwitchLabel} from "@headlessui/vue";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";

const useStore1 = useStore()
const {getProject} = storeToRefs(useStore1)

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false
})

const cqs = ref();
const groups = ref();
const topics = ref<TopicT[]>([]);
const searchQuery = ref('');
const consolidatedOnly = ref(false);

const ALL_TOPICS = { id: '', identifier: '', name: 'All catalogues' };
const UNCATEGORISED = { id: '__uncategorised__', identifier: '', name: 'Uncategorised' };
const selectedTopic = ref(ALL_TOPICS);

const selectedGroup = computed({
  get: () => useStore1.cqSelectedGroup,
  set: (val) => { useStore1.cqSelectedGroup = val; }
})

const unifiedView = computed({
  get: () => useStore1.cqUnifiedView,
  set: (val) => { useStore1.cqUnifiedView = val; }
})

function matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = fields.filter(Boolean).join(' ').toLowerCase();
  return q.split(/\s+/).every(word => text.includes(word));
}

const displayedCqs = computed(() => {
  if (!cqs.value) return null;
  let items = cqs.value.data as CompetencyQuestionReducedT[];

  if (selectedTopic.value.id === '__uncategorised__') {
    items = items.filter(cq => !cq.topic?.id);
  } else if (selectedTopic.value.id) {
    items = items.filter(cq => cq.topic?.id === selectedTopic.value.id);
  }

  if (consolidatedOnly.value) {
    items = items.filter(cq => cq.unifiedEntryKind === 'consolidation_result');
  }

  const q = searchQuery.value;
  if (q.trim()) {
    items = items.filter(cq => matchesSearch(q, cq.question, cq.comment));
  }
  return items;
})

const groupedByTopic = computed(() => {
  if (!displayedCqs.value) return null;

  const byTopicId = new Map<string | null, CompetencyQuestionReducedT[]>();
  for (const cq of displayedCqs.value) {
    const key = cq.topic?.id ?? null;
    if (!byTopicId.has(key)) byTopicId.set(key, []);
    byTopicId.get(key)!.push(cq);
  }

  const result: { topicId: string | null; identifier: string; name: string; cqs: CompetencyQuestionReducedT[] }[] = [];

  for (const topic of topics.value) {
    const bucket = byTopicId.get(topic.id);
    if (bucket && bucket.length > 0) {
      result.push({ topicId: topic.id, identifier: topic.identifier, name: topic.name, cqs: bucket });
    }
  }

  const uncategorised = byTopicId.get(null);
  if (uncategorised && uncategorised.length > 0) {
    result.push({ topicId: null, identifier: '', name: 'Uncategorised', cqs: uncategorised });
  }

  return result;
})

const topicFilterOptions = computed(() => {
  const opts: typeof ALL_TOPICS[] = [ALL_TOPICS];
  for (const t of topics.value) {
    opts.push({ id: t.id, identifier: t.identifier, name: t.name });
  }
  opts.push(UNCATEGORISED);
  return opts;
})

async function fetchTopics() {
  if (!getProject.value.id) return;
  const response = await TopicDataService.getAllForProject(getProject.value.id);
  if (!('messageType' in response)) {
    topics.value = response.data;
  }
}

function fetchGroups() {
  GroupDataService.getAllForOneProject(getProject.value.id).then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;
    } else {
      groups.value = response;
      groups.value.data.unshift({name: "No filter", id: ''});
      const stored = useStore1.cqSelectedGroup;
      if (!stored.id || !groups.value.data.find((g: any) => g.id === stored.id)) {
        useStore1.cqSelectedGroup = {name: "No filter", id: ''};
      }
      fetchCompetencyQuestion();
    }
  })
}

fetchGroups()
fetchTopics()

watch(getProject, () => {
  fetchGroups();
  fetchTopics();
  fetchCompetencyQuestion();
})

watch(selectedGroup, () => {
  fetchCompetencyQuestion();
})

watch(unifiedView, () => {
  fetchCompetencyQuestion();
})

async function fetchCompetencyQuestion() {
  let serviceCall;
  if (selectedGroup.value?.id) {
    serviceCall = unifiedView.value
      ? CompetencyQuestionDataService.getUnifiedForGroup(selectedGroup.value.id)
      : CompetencyQuestionDataService.getAllForOneGroup(selectedGroup.value.id);
  } else if (unifiedView.value) {
    serviceCall = CompetencyQuestionDataService.getUnifiedForProject(getProject.value.id);
  } else {
    serviceCall = CompetencyQuestionDataService.getAllForOneProject(getProject.value.id);
  }

  serviceCall.then(response => {
    if ("messageType" in response) {
      messagePopupData.value.uxresponse = {
        ...messagePopupData.value.uxresponse,
        ...response
      };
      messagePopupData.value.open = true;
    } else {
      cqs.value = response;
    }
  });
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="w-full">
    <DetailPageHeader title="Competency Questions" :project="getProject.name">
      <template #actions>
        <div class="flex items-center gap-2">
          <RouterLink to="/consolidations/add" class="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-300 dark:ring-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Consolidate
            <ArrowDownOnSquareIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </RouterLink>
          <RouterLink to="/questions/add/" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Add
            <PlusIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </RouterLink>
        </div>
      </template>
    </DetailPageHeader>

    <div class="mt-5 flex items-end gap-6 flex-wrap" v-if="selectedGroup">

      <!-- Unified view toggle -->
      <SwitchGroup as="div" class="flex items-center gap-x-3 flex-shrink-0">
        <Switch v-model="unifiedView"
                :class="[unifiedView ? 'bg-indigo-600' : 'bg-gray-200',
                         'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2']">
          <span aria-hidden="true"
                :class="[unifiedView ? 'translate-x-5' : 'translate-x-0',
                         'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
        </Switch>
        <SwitchLabel as="span" class="text-sm">
          <span class="font-medium text-gray-900 dark:text-gray-200">Unified view</span>
          <span class="ml-1 text-gray-500 dark:text-gray-400">(collapse consolidated sets)</span>
        </SwitchLabel>
      </SwitchGroup>

      <!-- Consolidated only toggle -->
      <SwitchGroup as="div" class="flex items-center gap-x-3 flex-shrink-0">
        <Switch v-model="consolidatedOnly"
                :class="[consolidatedOnly ? 'bg-indigo-600' : 'bg-gray-200',
                         'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2']">
          <span aria-hidden="true"
                :class="[consolidatedOnly ? 'translate-x-5' : 'translate-x-0',
                         'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
        </Switch>
        <SwitchLabel as="span" class="text-sm">
          <span class="font-medium text-gray-900 dark:text-gray-200">Consolidated only</span>
        </SwitchLabel>
      </SwitchGroup>

      <!-- Group filter -->
      <Listbox as="div" v-model="selectedGroup" class="flex-1 min-w-48">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Filter by group</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton class="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
            <span class="truncate">{{ selectedGroup.name }}</span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
              <ListboxOption as="template" v-for="g in groups.data" :key="g.id" :value="g" v-slot="{ active, selected }">
                <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                  <div class="flex items-center justify-between">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">{{ g.name }}</span>
                    <span v-if="g.noQuestions != null"
                          :class="[active
                            ? 'bg-white/20 text-white ring-white/30'
                            : 'bg-indigo-50 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-400 ring-indigo-700/10 dark:ring-indigo-400/30',
                            'ml-2 flex-shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset']">
                      {{ g.noQuestions }}
                    </span>
                  </div>
                  <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>

      <!-- Catalogue filter -->
      <Listbox as="div" v-model="selectedTopic" class="flex-1 min-w-48">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Filter by catalogue</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton class="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
            <span class="truncate">
              <span v-if="selectedTopic.identifier" class="mr-1.5 font-semibold text-indigo-600 dark:text-indigo-400">{{ selectedTopic.identifier }}</span>{{ selectedTopic.name }}
            </span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
              <ListboxOption as="template" v-for="t in topicFilterOptions" :key="t.id" :value="t" v-slot="{ active, selected }">
                <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                  <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate flex items-center gap-1.5']">
                    <span v-if="t.identifier" class="font-bold">{{ t.identifier }}</span>{{ t.name }}
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

      <!-- Search -->
      <div class="flex-1 min-w-52">
        <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Search</label>
        <div class="relative mt-2">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input v-model="searchQuery"
                 type="text"
                 placeholder="Search questions..."
                 class="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6" />
        </div>
      </div>

    </div> <!-- end controls row -->

    <div v-if="cqs">
      <div v-if="displayedCqs && displayedCqs.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery.trim() ? 'No questions match your search.' : 'There are no CQs yet!' }}
      </div>

      <!-- Grouped by catalogue -->
      <template v-if="groupedByTopic">
        <div v-for="group in groupedByTopic"
             :key="group.topicId ?? '__uncategorised__'"
             class="mt-6">
          <!-- Catalogue header -->
          <div class="flex items-center gap-2 mb-2">
            <span v-if="group.identifier"
                  class="inline-flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-400/20 px-2.5 py-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30 min-w-[2.5rem] text-center">
              {{ group.identifier }}
            </span>
            <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-300"
                :class="group.topicId === null ? 'italic' : ''">
              {{ group.name }}
            </h2>
            <span class="text-xs text-gray-400 dark:text-gray-500">
              ({{ group.cqs.length }})
            </span>
          </div>

          <!-- CQ cards in this catalogue -->
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-2 space-y-1">
            <CQListItem v-for="cq in group.cqs" :key="cq.id"
                        :cq="cq"
                        :project-id="getProject.id" />
          </div>
        </div>
      </template>
    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_" class="border-1 shadow rounded-lg p-4 max-w-xl w-full dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4">
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
