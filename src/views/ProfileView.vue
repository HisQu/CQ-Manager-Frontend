<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "../store.ts";
import MessagePopup from "../components/MessagePopup.vue";
import UserDataService from "../services/UserDataService.ts";
import { KeyIcon, ShieldCheckIcon } from "@heroicons/vue/24/solid";
import { libravatarUrl } from "../utils/libravatar.ts";

const store = useStore();
const user = computed(() => store.getUser);
const avatarUrl = computed(() => libravatarUrl(user.value.email, 96));

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

  <div class="w-full max-w-md space-y-10">

    <!-- User info -->
    <div>
      <h1 class="text-2xl font-bold dark:text-white text-gray-900 mb-6">Profile</h1>
      <div class="flex items-center gap-x-5">
        <img :src="avatarUrl" referrerpolicy="no-referrer"
             class="h-16 w-16 rounded-full flex-shrink-0"
             :alt="user.name" />
        <div class="min-w-0">
          <div class="flex items-center gap-x-2 flex-wrap">
            <p class="text-lg font-semibold text-gray-900 dark:text-white truncate">{{ user.name }}</p>
            <span v-if="user.isSystemAdmin"
                  class="inline-flex items-center gap-x-1 rounded-md bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
              <ShieldCheckIcon class="h-3 w-3" />
              System Admin
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
          <a href="https://www.libravatar.org/" target="_blank" rel="noopener noreferrer"
             class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">
            Set profile picture on Libravatar
          </a>
        </div>
      </div>
    </div>

    <!-- Change password -->
    <div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-5">Change Password</h2>
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

  </div>
</template>
