<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import UserDataService from "../services/UserDataService.ts";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import { ArrowDownOnSquareIcon } from "@heroicons/vue/24/solid";

export default {
  name: "UserCreateView",
  components: { MessagePopup, SubmitButtonWithCallback, ArrowDownOnSquareIcon },
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
        password: "",
      },
    };
  },
  methods: {
    async save() {
      const response = await UserDataService.register({
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
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
  },
};
</script>

<template>
  <div class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;" />
  </div>

  <h1 class="text-2xl">Create new user</h1>

  <div class="my-5">
    <label for="user-name" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
      Full name:
    </label>
    <div class="mt-2">
      <input type="text" v-model="form.name" id="user-name" name="user-name"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
    </div>
  </div>

  <div class="my-5">
    <label for="user-email" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
      E-mail address:
    </label>
    <div class="mt-2">
      <input type="email" v-model="form.email" id="user-email" name="user-email"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
    </div>
  </div>

  <div class="my-5">
    <label for="user-password" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
      Initial password:
    </label>
    <div class="mt-2">
      <input type="password" v-model="form.password" id="user-password" name="user-password"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
    </div>
  </div>

  <div class="flex justify-end mt-4">
    <SubmitButtonWithCallback
      agree-button-text="Create user"
      title="Are you sure you want to create this user?"
      detail="The user will be created with the provided credentials."
      @modalsuccessclose="save()">
      <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
      Create
    </SubmitButtonWithCallback>
  </div>
</template>

<style scoped>
</style>
