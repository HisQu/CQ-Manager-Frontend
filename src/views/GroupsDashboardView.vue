<script setup lang="ts">
import GroupListItem from "../components/GroupListItem.vue";
import GroupDataService from "../services/GroupDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import {PlusIcon} from "@heroicons/vue/20/solid";
import {ref} from "vue";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";
import {Switch, SwitchGroup, SwitchLabel} from "@headlessui/vue";
const useStore1 = useStore()
const {getProject} = storeToRefs(useStore1)


const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
});

const groups = ref();
const onlyShowMyGroups = ref(true);

async function fetchGroups() {
  const response = onlyShowMyGroups.value
      ? await GroupDataService.getAllForOneProjectThatIBelongTo(getProject.value.id)
      : await GroupDataService.getAll();

  if ("messageType" in response) {
    messagePopupData.value.uxresponse = {
      ...messagePopupData.value.uxresponse,
      ...response
    };
    messagePopupData.value.open = true;
  } else {
    groups.value = response;
    console.log(groups.value.data);
  }
}


fetchGroups()

</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="mx-auto max-w-5xl">
    <h1 class="text-2xl">
      Group Overview
      <RouterLink to="/groups/add/"
                  class="float-right inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Add
        <PlusIcon class="-mr-0.5 h-5 w-5" aria-hidden="true"/>
      </RouterLink>
    </h1>
    <div class="mt-5">
      <SwitchGroup as="div" class="flex items-center">
        <Switch v-model="onlyShowMyGroups" @update:model-value="fetchGroups()" :class="[onlyShowMyGroups ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2']">
          <span aria-hidden="true" :class="[onlyShowMyGroups ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
        </Switch>
        <SwitchLabel as="span" class="ml-3 text-sm">
          <span class="font-medium text-gray-900 dark:text-gray-200">Only show my groups</span>
        </SwitchLabel>
      </SwitchGroup>
    </div>
    <div v-if="groups">
      <div v-if="groups.data.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        {{ onlyShowMyGroups ? 'You are not part of any groups.' : 'There are no groups.' }}
      </div>
      <GroupListItem v-for="group in groups.data"
                     :project="group.project"
                     :key="group.id"
                     :name="group.name"
                     :members="group.noMembers"
                     :group_id="group.id"/>
    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_" class="border-1 shadow rounded-md p-4 max-w-xl w-full mx-auto dark:bg-gray-700
          dark:text-gray-200 bg-gray-100 mt-10">
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