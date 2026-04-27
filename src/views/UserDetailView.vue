<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import { ArrowDownOnSquareIcon, TrashIcon, EnvelopeIcon } from "@heroicons/vue/24/solid";
import UserDataService from "../services/UserDataService.ts";

export default {
  name: "UserDetailView",
  components: { MessagePopup, SubmitButtonWithCallback, ArrowDownOnSquareIcon, TrashIcon, EnvelopeIcon },
  props: {
    email: { type: String, required: true },
  },
  data() {
    return {
      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "",
          text: "",
          detail: "",
        },
        open: false,
      },
      form: {
        name: "",
        email: "",
        is_system_admin: false,
        is_verified: false,
      },
      newPassword: "",
    };
  },
  methods: {
    async fetchUser() {
      const response = await UserDataService.getOne(this.email);
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
        this.messagePopupData.open = true;
      } else {
        this.form.name = response.data.name;
        this.form.email = response.data.email;
        this.form.is_system_admin = response.data.is_system_admin;
        this.form.is_verified = response.data.is_verified;
      }
    },
    async saveUser() {
      const response = await UserDataService.update(this.email, {
        name: this.form.name,
        email: this.form.email,
        is_system_admin: this.form.is_system_admin,
      });
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
        this.messagePopupData.open = true;
      } else {
        this.$router.push("/users");
      }
    },
    async resetPassword() {
      if (!this.newPassword) return;
      const response = await UserDataService.update(this.email, {
        password: this.newPassword,
      });
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
        this.messagePopupData.open = true;
      } else {
        this.newPassword = "";
        this.messagePopupData.uxresponse = {
          title: "Password reset",
          messageType: "success",
          text: "The password has been updated successfully.",
          detail: "",
        };
        this.messagePopupData.open = true;
      }
    },
    async sendInvitation() {
      const response = await UserDataService.verify(this.email);
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
        this.messagePopupData.open = true;
      } else {
        this.form.is_verified = true;
        this.messagePopupData.uxresponse = {
          title: "Invitation sent",
          messageType: "success",
          text: "The user has been verified successfully.",
          detail: "",
        };
        this.messagePopupData.open = true;
      }
    },
    async deleteUser() {
      await UserDataService.delete(this.email);
      this.$router.push("/users");
    },
  },
  mounted() {
    this.fetchUser();
  },
};
</script>

<template>
  <div class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;" />

    <h1 class="text-2xl">Edit User</h1>

    <div v-if="form.email">
      <div class="my-5">
        <label for="edit-name" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
          Full name:
        </label>
        <input type="text" v-model="form.name" id="edit-name"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

      <div class="my-5">
        <label for="edit-email" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
          E-mail address:
        </label>
        <input type="email" v-model="form.email" id="edit-email"
               class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>

      <div class="my-5 flex items-center gap-x-3">
        <input type="checkbox" v-model="form.is_system_admin" id="edit-admin"
               class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
        <label for="edit-admin" class="text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">
          System Administrator
        </label>
      </div>

      <div class="my-5">
        <span class="text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">Verification status: </span>
        <span v-if="form.is_verified" class="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Verified</span>
        <span v-else class="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Unverified</span>
      </div>

      <div class="flex items-center justify-between mt-6">
        <SubmitButtonWithCallback
          agree-button-text="Delete user"
          title="Are you sure you want to delete this user?"
          detail="This action is permanent and cannot be undone."
          @modalsuccessclose="deleteUser">
          <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Delete
        </SubmitButtonWithCallback>

        <button type="button" @click="saveUser"
                class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Save
        </button>
      </div>

      <hr class="my-8 border-gray-300 dark:border-gray-600" />

      <div>
        <h2 class="text-xl mb-4">Send Invitation</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Marks the user account as verified and active.
        </p>
        <SubmitButtonWithCallback
          agree-button-text="Send invitation"
          title="Send invitation to this user?"
          detail="This will mark the user as verified."
          @modalsuccessclose="sendInvitation">
          <EnvelopeIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Send Invitation
        </SubmitButtonWithCallback>
      </div>

      <hr class="my-8 border-gray-300 dark:border-gray-600" />

      <div>
        <h2 class="text-xl mb-4">Reset Password</h2>
        <div class="my-3">
          <label for="new-password" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
            New password:
          </label>
          <input type="password" v-model="newPassword" id="new-password"
                 class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        </div>
        <div class="flex justify-end mt-4">
          <SubmitButtonWithCallback
            agree-button-text="Reset password"
            title="Are you sure you want to reset the password?"
            detail="The user's current password will be replaced immediately."
            @modalsuccessclose="resetPassword">
            <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Reset Password
          </SubmitButtonWithCallback>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="border-1 shadow rounded-md p-4 w-full mx-auto dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-10">
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
