<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import EmailChipsInput from "../components/EmailChipsInput.vue";
import { ArrowDownOnSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
import ProjectDataService from "../services/ProjectDataService.ts";


export default {
  name: "ProjectDetailView",
  components: { MessagePopup, ArrowDownOnSquareIcon, SubmitButtonWithCallback, TrashIcon, EmailChipsInput },
  props: {
    id: { type: String, required: true }
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
      name: "",
      managers: [] as { id: string; email: string; name: string }[],
      engineers: [] as { id: string; email: string; name: string }[],
    }
  },
  methods: {
    async fetchProject() {
      const response = await ProjectDataService.getOne(this.id);
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.name = response.data.name;
        this.managers = response.data.managers;
        this.engineers = response.data.engineers;
      }
    },
    async saveProject() {
      const response = await ProjectDataService.update(this.id, {
        name: this.name,
        managers: this.managers.map(m => m.email),
        engineers: this.engineers.map(m => m.email),
      });
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.$router.push('/projects/');
      }
    },
    deleteProject() {
      ProjectDataService.delete(this.id);
      this.$router.push('/projects/');
    },
    addManager(email: string) {
      ProjectDataService.addManagers(this.id, [email]).then(response => {
        if ("messageType" in response && response.messageType === 'error') {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        }
        this.fetchProject();
      });
    },
    removeManager(member: { id?: string; email: string; name?: string }) {
      if (!member.id) return;
      ProjectDataService.removeManagers(this.id, [member.id]).then(response => {
        if ("messageType" in response && response.messageType === 'error') {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        }
        this.fetchProject();
      });
    },
    addEngineer(email: string) {
      ProjectDataService.addEngineers(this.id, [email]).then(response => {
        if ("messageType" in response && response.messageType === 'error') {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        }
        this.fetchProject();
      });
    },
    removeEngineer(member: { id?: string; email: string; name?: string }) {
      if (!member.id) return;
      ProjectDataService.removeEngineers(this.id, [member.id]).then(response => {
        if ("messageType" in response && response.messageType === 'error') {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        }
        this.fetchProject();
      });
    },
  },
  mounted() {
    this.fetchProject();
  }
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse" :open="messagePopupData.open" @close="messagePopupData.open = false;" />

  <div v-if="name" class="w-full">
    <h1 class="text-2xl font-semibold dark:text-white">{{ name }}</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Project</p>

    <hr class="my-6 border-gray-200 dark:border-gray-700"/>

    <div class="mb-6">
      <label for="project_name" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Project title
      </label>
      <input
          type="text"
          name="project_name"
          id="project_name"
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          v-model="name"
      />
    </div>

    <div class="mb-6">
      <EmailChipsInput
          :members="managers"
          label="Project managers"
          input-id="project_managers"
          @add="addManager"
          @remove="removeManager"
      />
    </div>

    <div class="mb-8">
      <EmailChipsInput
          :members="engineers"
          label="Ontology engineers"
          input-id="project_engineers"
          @add="addEngineer"
          @remove="removeEngineer"
      />
    </div>

    <div class="flex items-center justify-between">
      <SubmitButtonWithCallback
          agree-button-text="Delete the project"
          title="Are you sure you want to delete the project?"
          detail="This action is permanent."
          @modalsuccessclose="deleteProject"
      >
        <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Delete
      </SubmitButtonWithCallback>

      <button
          type="button"
          class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          @click="saveProject"
      >
        <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Save
      </button>
    </div>
  </div>
</template>
