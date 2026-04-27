<script lang="ts">
import {defineComponent} from 'vue'
import Logo from "../components/Logo.vue";
import {useStore} from "../store.ts";
import MessagePopup from "../components/MessagePopup.vue";
import ProjectDataService from "../services/ProjectDataService.ts";

export default defineComponent({
  name: "LoginView",
  components: {MessagePopup, Logo},

  data: function () {
    return {
      store: useStore(),
      email: "",
      password: "",
      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "",
          text: "",
          detail: "",
        },
        open: false
      }
    }
  },

  methods: {
    async login() {
      const response = await this.store.login(this.email, this.password);
      if (typeof response !== "boolean") {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;
      } else {
        const projectsResponse = await ProjectDataService.getAll();
        if (!("messageType" in projectsResponse) && projectsResponse.data.length > 0) {
          this.store.project = projectsResponse.data[0];
        }
        this.$router.push("/questions");
      }
    }
  }
})
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <Logo class="mx-auto text-5xl h-14"/>
      <h2 class="mt-10 text-center text-xl font-bold leading-9 tracking-tight dark:text-gray-300 text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="login">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Email
            address</label>
          <div class="mt-2">
            <input id="email" v-model="email" name="email" type="email" autocomplete="email" required=""
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password"
                   class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Password</label>
          </div>
          <div class="mt-2">
            <input id="password" v-model="password" name="password" type="password" autocomplete="current-password"
                   required=""
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset
                    ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600
                    sm:text-sm sm:leading-6"/>
          </div>
        </div>

        <div>
          <button type="submit"
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6
                    text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>