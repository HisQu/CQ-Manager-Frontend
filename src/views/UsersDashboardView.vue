<script setup lang="ts">
import UserDataService from "../services/UserDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import { PlusIcon, CheckBadgeIcon, ShieldCheckIcon } from "@heroicons/vue/20/solid";
import { ref } from "vue";

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
    text: "",
    detail: "",
  },
  open: false
});

const users = ref();

const response = await UserDataService.getAll();
if ("messageType" in response) {
  messagePopupData.value.uxresponse = {
    ...messagePopupData.value.uxresponse,
    ...response
  };
  messagePopupData.value.open = true;
} else {
  users.value = response.data;
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;" />
  <div class="w-full">
    <DetailPageHeader title="Users">
      <template #actions>
        <RouterLink to="/users/create" class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          Create
          <PlusIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
        </RouterLink>
      </template>
    </DetailPageHeader>

    <div v-if="users" class="mt-6">
      <div v-for="user in users" :key="user.email"
           class="border-1 shadow rounded-md p-4 dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4 flex items-center justify-between">
        <div>
          <div class="font-semibold text-gray-900 dark:text-gray-100">{{ user.name }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
          <div class="mt-1 flex gap-2">
            <span v-if="user.is_system_admin" class="inline-flex items-center gap-x-1 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              <ShieldCheckIcon class="h-3.5 w-3.5" />
              Admin
            </span>
            <span v-if="user.is_verified" class="inline-flex items-center gap-x-1 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <CheckBadgeIcon class="h-3.5 w-3.5" />
              Verified
            </span>
            <span v-else class="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              Unverified
            </span>
          </div>
        </div>
        <RouterLink :to="`/users/${encodeURIComponent(user.email)}`"
                    class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          Edit
        </RouterLink>
      </div>
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
