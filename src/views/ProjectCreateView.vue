<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import AddProjectDataService from "../services/ProjectDataService.ts";
import SaveButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import EmailChipsInput from "../components/EmailChipsInput.vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/24/solid";
import UserDataService from "../services/UserDataService.ts";

type Member = { email: string }

export default{
  name: "ProjectCreateView",
  components: {MessagePopup, ArrowDownOnSquareIcon, SaveButtonWithCallback, EmailChipsInput},
  props: {
    index: {type: String}
  },
  data() {
    return {
      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "" as UXResponse["messageType"],
          text: "",
          detail: "",
        },
        open: false,
      },
      add: {
        project: "",
      },

      projectTitle: "",
      projectManagers: [] as Member[],
      engineers: [] as Member[],
      allUsers: [] as { email: string; name: string }[],
    }
  },
  mounted() {
    UserDataService.getAll().then(response => {
      if (!('messageType' in response)) this.allUsers = response.data;
    });
  },
  methods: {
    addProjectManager(email: string) {
      this.projectManagers.push({ email });
    },
    removeProjectManager(member: Member) {
      this.projectManagers = this.projectManagers.filter(m => m.email !== member.email);
    },
    addEngineer(email: string) {
      this.engineers.push({ email });
    },
    removeEngineer(member: Member) {
      this.engineers = this.engineers.filter(m => m.email !== member.email);
    },

    async save() {
      const response = await AddProjectDataService.add({
        name: this.projectTitle,
        managers: this.projectManagers.map(m => m.email),
        engineers: this.engineers.map(m => m.email),
      });

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        this.add.project = response.data.project;
        this.$router.push('/projects/');
      }
    }
  }
};
</script>

<template>
  <div class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>
  </div>

  <h1 class="text-2xl">
    Add new project
  </h1>

  <div class="my-5">
    <label for="project" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-3">
      Type in project title:
    </label>
    <div class="mt-2">
      <textarea v-model="projectTitle" rows="1" name="project_name" id="project"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
    </div>
  </div>

  <div class="content-container">
    <div class="mb-4">
      <EmailChipsInput
        :members="projectManagers"
        :suggestions="allUsers"
        label="Assign project manager:"
        input-id="project-managers"
        placeholder="Enter email and press Enter"
        @add="addProjectManager"
        @remove="removeProjectManager"
      />
    </div>
    <div class="mb-4">
      <EmailChipsInput
        :members="engineers"
        :suggestions="allUsers"
        label="Assign engineer:"
        input-id="engineers"
        placeholder="Enter email and press Enter"
        @add="addEngineer"
        @remove="removeEngineer"
      />
    </div>
    <div class="button-container">
      <SaveButtonWithCallback class="mt-4"
                              agree-button-text="Save this project?"
                              title="Are you sure you want to add this project?"
                              detail="Check for typos."
                              @modalsuccessclose="save()">
        <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
        Save
      </SaveButtonWithCallback>
    </div>
  </div>
</template>

<style scoped>
.content-container {
  display: flex;
  flex-direction: column;
}

.button-container {
  display: flex;
  justify-content: flex-end;
}
</style>


