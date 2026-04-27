<script setup lang="ts">
import CompetencyQuestionListItem from "../components/CompetencyQuestionListItem.vue";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {PlusIcon,ChevronUpDownIcon,CheckIcon} from "@heroicons/vue/20/solid"
import {ref, watch} from "vue";
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
const selectedGroup = ref();
const unifiedView = ref(true);

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
      selectedGroup.value = {name: "No filter", id: ''};
      console.log()
      console.log(groups.value.data)
      fetchCompetencyQuestion();
    }
  })
}

fetchGroups()

watch(getProject, (_, __) => {
  fetchGroups();
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
        <RouterLink to="/questions/add/" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Add
          <PlusIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </RouterLink>
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

      <!-- Group filter -->
      <Listbox as="div" v-model="selectedGroup" class="flex-1 min-w-48">
        <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Filter by group</ListboxLabel>
        <div class="relative mt-2">
          <ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
        <span class="inline-flex w-full truncate">
          <span class="truncate">{{ selectedGroup.name }}</span>
          <span class="ml-2 truncate text-gray-500">{{ selectedGroup.username }}</span>
        </span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
          </ListboxButton>

          <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <ListboxOption as="template" v-for="g in groups.data" :key="g.id" :value="g" v-slot="{ active, selected }">
                <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                  <div class="flex">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">{{ g.name }}</span>
                    <span :class="[active ? 'text-indigo-200' : 'text-gray-500', 'ml-2 truncate']">{{ g.project ? "Project: " + g.project?.name : '' }}</span>
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
    </div> <!-- end controls row -->

    <div v-if="cqs">
      <div v-if="cqs.data.length === 0" class="mt-10">
        There are no CQs yet!
      </div>
      <CompetencyQuestionListItem v-for="cq in cqs.data"
                                  :card-style="true"
                                  class="max-w-xl"
                                  :text="cq.question"
                                  :numberOfConsolidations="cq.noConsolidations"
                                  :creator="cq.creator"
                                  :identifier="cq.id"
                                  :groupIdentifier="cq.group.id"
                                  :rating="cq.rating"/>
    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_" class="border-1 shadow rounded-md p-4 max-w-xl w-full mx-auto dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-10">
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