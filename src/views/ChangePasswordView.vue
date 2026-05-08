<script setup lang="ts">
import { ref } from "vue";
import MessagePopup from "../components/MessagePopup.vue";
import UserDataService from "../services/UserDataService.ts";
import { KeyIcon } from "@heroicons/vue/24/solid";

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false,
});

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const saving = ref(false);

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    messagePopupData.value.uxresponse = {
      title: "Passwords do not match",
      messageType: "warning",
      text: "The new password and confirmation password must be identical.",
      detail: "",
    };
    messagePopupData.value.open = true;
    return;
  }

  saving.value = true;
  const response = await UserDataService.changePassword(currentPassword.value, newPassword.value);
  saving.value = false;

  if ("messageType" in response) {
    messagePopupData.value.uxresponse = { ...messagePopupData.value.uxresponse, ...response };
    messagePopupData.value.open = true;
  } else {
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    messagePopupData.value.uxresponse = {
      title: "Password changed",
      messageType: "success",
      text: "Your password has been updated successfully.",
      detail: "",
    };
    messagePopupData.value.open = true;
  }
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;" />

  <div class="w-full max-w-md">
    <h1 class="text-2xl font-bold dark:text-white text-gray-900 mb-8">Change Password</h1>

    <form class="space-y-5" @submit.prevent="changePassword">
      <div>
        <label for="current-password" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          Current password
        </label>
        <input id="current-password"
               type="password"
               v-model="currentPassword"
               autocomplete="current-password"
               required
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

      <div>
        <label for="new-password" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          New password
        </label>
        <input id="new-password"
               type="password"
               v-model="newPassword"
               autocomplete="new-password"
               required
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

      <div>
        <label for="confirm-password" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
          Confirm new password
        </label>
        <input id="confirm-password"
               type="password"
               v-model="confirmPassword"
               autocomplete="new-password"
               required
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

      <div class="flex justify-end pt-2">
        <button type="submit"
                :disabled="saving"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed">
          <KeyIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
          {{ saving ? 'Saving...' : 'Change Password' }}
        </button>
      </div>
    </form>
  </div>
</template>
