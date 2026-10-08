<script setup lang="ts">
import { t } from '../i18n'

import CQListItem from "../components/CQListItem.vue";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import TopicDataService from "../services/TopicDataService.ts";
import TagDataService from "../services/TagDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import ExportCqModal from "../components/ExportCqModal.vue";
import CqFilterPanel from "../components/CqFilterPanel.vue";
import CqFilterButton from "../components/CqFilterButton.vue";
import CqSortControl from "../components/CqSortControl.vue";
import FilterMultiSelect from "../components/FilterMultiSelect.vue";
import {sortCqs} from "../utils/cqSort.ts";
import {matchesCqSearch, tagFilterOptions, useCqFilters} from "../utils/cqFilters.ts";
import {PlusIcon, ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon, ArrowDownOnSquareIcon, ArrowDownTrayIcon, ChatBubbleBottomCenterTextIcon} from "@heroicons/vue/20/solid"
import {ref, computed, watch} from "vue";
import GroupDataService from "../services/GroupDataService.ts";
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, Switch, SwitchGroup, SwitchLabel} from "@headlessui/vue";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";
import {isUncatalogued, UNCATALOGUED_IDENTIFIER, catalogueName} from "../utils/catalogues.ts";

const useStore1 = useStore()
const {
  getProject,
  cqSelectedTopicIds: selectedTopicIds,
  cqShowLastComment: showLastComment,
  cqSearchQuery: searchQuery,
  cqFilters,
  cqFiltersOpen: filtersOpen,
  cqSort: sort,
} = storeToRefs(useStore1)

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
const tags = ref<TagT[]>([]);
const tagOptions = computed(() => tagFilterOptions(tags.value));
const exportModalOpen = ref(false);

const {filters, activeFilterCount, authorOptions, matchesFilters} = useCqFilters(() => cqs.value?.data, cqFilters);

const selectedGroup = computed({
  get: () => useStore1.cqSelectedGroup,
  set: (val) => { useStore1.cqSelectedGroup = val; }
})

const unifiedView = computed({
  get: () => useStore1.cqUnifiedView,
  set: (val) => { useStore1.cqUnifiedView = val; }
})

const displayedCqs = computed(() => {
  if (!cqs.value) return null;
  let items = cqs.value.data as CompetencyQuestionReducedT[];

  if (selectedTopicIds.value.length) {
    items = items.filter(cq => !!cq.topic && selectedTopicIds.value.includes(cq.topic.id));
  }

  items = items.filter(matchesFilters);

  items = items.filter(cq => matchesCqSearch(cq, searchQuery.value));
  return sortCqs(items, sort.value);
})

// Sorting by catalogue ID keeps the CQs grouped by catalogue; every other sort shows one flat list.
const groupByCatalogue = computed(() => sort.value.field === 'catalogue');

const groupedByTopic = computed(() => {
  if (!displayedCqs.value) return null;

  const byTopicId = new Map<string, CompetencyQuestionReducedT[]>();
  for (const cq of displayedCqs.value) {
    const key = cq.topic?.id ?? '';
    if (!byTopicId.has(key)) byTopicId.set(key, []);
    byTopicId.get(key)!.push(cq);
  }

  // `displayedCqs` is already sorted by catalogue ID, so the groups come out in the chosen direction.
  const result: { topicId: string; identifier: string; name: string; cqs: CompetencyQuestionReducedT[] }[] = [];
  for (const [topicId, bucket] of byTopicId) {
    const topic = topics.value.find(t => t.id === topicId)
      ?? bucket[0].topic
      ?? { identifier: UNCATALOGUED_IDENTIFIER, get name() { return t('uncatalogued') } };
    result.push({ topicId, identifier: topic.identifier, name: catalogueName(topic), cqs: bucket });
  }
  return result;
})

const topicFilterOptions = computed(() =>
  topics.value.map(topic => ({ value: topic.id, prefix: topic.identifier, get label() { return catalogueName(topic) } })));

async function fetchTopics() {
  if (!getProject.value.id) return;
  const response = await TopicDataService.getAllForProject(getProject.value.id);
  if (!('messageType' in response)) {
    topics.value = response.data;
    // Drop persisted catalogue filters that do not exist in this project (anymore).
    const existing = selectedTopicIds.value.filter(id => topics.value.some(t => t.id === id));
    if (existing.length !== selectedTopicIds.value.length) selectedTopicIds.value = existing;
  }
}

async function fetchTags() {
  if (!getProject.value.id) return;
  const response = await TagDataService.getAllForProject(getProject.value.id);
  if (!('messageType' in response)) {
    tags.value = response.data;
    // Drop persisted tag filters that do not exist in this project (anymore).
    const existing = filters.value.tag.filter(id => id === 'none' || tags.value.some(t => t.id === id));
    if (existing.length !== filters.value.tag.length) {
      filters.value = { ...filters.value, tag: existing };
    }
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
fetchTags()

watch(getProject, () => {
  fetchGroups();
  fetchTopics();
  fetchTags();
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
  <ExportCqModal v-if="displayedCqs" :open="exportModalOpen" :cqs="displayedCqs" @close="exportModalOpen = false" />
  <div class="w-full">
    <DetailPageHeader :title="$t('competencyQuestions')" :project="getProject.name">
      <template #actions>
        <div class="flex items-center gap-2">
          <button type="button"
                  :disabled="!displayedCqs || displayedCqs.length === 0"
                  class="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-300 dark:ring-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="exportModalOpen = true">
            {{ $t('export') }}
            <ArrowDownTrayIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </button>
          <RouterLink to="/consolidations/add" class="inline-flex items-center gap-x-2 rounded-md bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-300 dark:ring-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {{ $t('consolidate') }}
            <ArrowDownOnSquareIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </RouterLink>
          <RouterLink to="/questions/add/" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {{ $t('add') }}
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
          <span class="font-medium text-gray-900 dark:text-gray-200">{{ $t('unifiedView') }}</span>
          <span class="ml-1 text-gray-500 dark:text-gray-400">{{ $t('collapseConsolidatedSets') }}</span>
        </SwitchLabel>
      </SwitchGroup>

      <!-- Group filter -->
      <Listbox as="div" v-model="selectedGroup" by="id" class="flex-1 min-w-48">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">{{ $t('filterByGroup') }}</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton class="relative w-full cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
            <span class="truncate">{{ selectedGroup.id ? selectedGroup.name : $t('noFilter') }}</span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>

          <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm">
              <ListboxOption as="template" v-for="g in groups.data" :key="g.id" :value="g" v-slot="{ active, selected }">
                <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                  <div class="flex items-center justify-between">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">{{ g.id ? g.name : $t('noFilter') }}</span>
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
      <FilterMultiSelect class="flex-1 min-w-48"
                         :label="$t('filterByCatalogue')"
                         :placeholder="$t('allCatalogues')"
                         v-model="selectedTopicIds"
                         :options="topicFilterOptions" />

    </div> <!-- end controls row -->

    <!-- Search, sort and filters -->
    <div class="mt-4 flex items-end gap-4 flex-wrap" v-if="selectedGroup">
      <div class="flex-1 min-w-52">
        <label class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">{{ $t('search') }}</label>
        <div class="relative mt-2">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input v-model="searchQuery"
                 type="text"
                 :placeholder="$t('searchQuestions2')"
                 class="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6" />
        </div>
      </div>

      <CqSortControl v-model="sort" />
      <button type="button"
              :aria-pressed="showLastComment"
              :title="showLastComment ? $t('hideTheLastCommentOfEachCQ') : $t('showTheLastCommentOfEachCQ')"
              :class="['flex-shrink-0 inline-flex items-center gap-x-2 rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset',
                       showLastComment
                         ? 'bg-indigo-50 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 ring-indigo-300 dark:ring-indigo-500/50 hover:bg-indigo-100 dark:hover:bg-indigo-400/20'
                         : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700']"
              @click="showLastComment = !showLastComment">
        <ChatBubbleBottomCenterTextIcon :class="['-ml-0.5 h-5 w-5', showLastComment ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400']" aria-hidden="true" />
        {{ $t('lastComment') }}
      </button>
      <CqFilterButton v-model="filtersOpen" :active-count="activeFilterCount" />
    </div>

    <CqFilterPanel v-if="filtersOpen" class="mt-4" v-model="filters" :author-options="authorOptions" :tag-options="tagOptions" />

    <div v-if="cqs">
      <div v-if="displayedCqs && displayedCqs.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        {{ searchQuery.trim() || activeFilterCount || selectedTopicIds.length ? $t('noQuestionsMatchYourSearchAndFilters') : $t('thereAreNoCQsYet') }}
      </div>

      <!-- Grouped by catalogue -->
      <template v-if="groupByCatalogue && groupedByTopic">
        <div v-for="group in groupedByTopic"
             :key="group.topicId"
             class="mt-6">
          <!-- Catalogue header -->
          <div class="flex items-center gap-2 mb-2">
            <span v-if="group.identifier"
                  class="inline-flex items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-400/20 px-2.5 py-0.5 text-sm font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30 min-w-[2.5rem] text-center">
              {{ group.identifier }}
            </span>
            <h2 class="text-sm font-semibold text-gray-600 dark:text-gray-300"
                :class="isUncatalogued(group) ? 'italic' : ''">
              {{ group.name }}
            </h2>
            <span class="text-xs text-gray-400 dark:text-gray-500">
              ({{ group.cqs.length }})
            </span>
          </div>

          <!-- CQ cards in this catalogue -->
          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-3 space-y-2">
            <CQListItem v-for="cq in group.cqs" :key="cq.id"
                        :cq="cq"
                        :project-id="getProject.id"
                        :show-last-comment="showLastComment" />
          </div>
        </div>
      </template>

      <!-- Flat list in the chosen order -->
      <div v-else-if="displayedCqs && displayedCqs.length > 0"
           class="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-3 space-y-2">
        <CQListItem v-for="cq in displayedCqs" :key="cq.id"
                    :cq="cq"
                    :project-id="getProject.id"
                    :show-last-comment="showLastComment" />
      </div>
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
