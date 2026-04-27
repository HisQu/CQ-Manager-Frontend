<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import { ArrowDownOnSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
import ProjectDataService from "../services/ProjectDataService.ts";


export default {
  name: "ProjectDetailView",
  components: { MessagePopup, ArrowDownOnSquareIcon, SubmitButtonWithCallback, TrashIcon },
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
      add: {
        name: "",
        projectManagerInputField: '',
        projectManager: [] as { id: string; email: string; name: string }[],

        engineerInputField: '',
        engineer: [] as { id: string; email: string; name: string }[],
      },
    }
  },
  methods: {
    async fetchProject() {
      const response = await ProjectDataService.getOne(this.id);

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
        this.messagePopupData.open = true;
      } else {
        const { name, managers, engineers } = response.data;
        this.add.name = name;
        this.add.projectManager = managers;
        this.add.engineer = engineers;
      }
    },
    async saveProject() {
      try {
        const response = await ProjectDataService.update(this.id, {
          name: this.add.name,
          managers: this.add.projectManager.map(m => m.email),
          engineers: this.add.engineer.map(m => m.email)
        });

        if ("messageType" in response) {
          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response
          };
          this.messagePopupData.open = true;
        } else {
          this.add.name = response.data.name;
          this.$router.push('/projects/');
        }
      } catch (error) {
        console.error("Error in saveProject:", error);
      }
    },
    deleteProject() {
      ProjectDataService.delete(this.id);
      this.$router.push('/projects/');
    },
    addEditProjectManager() {
      if (this.add.projectManagerInputField !== '') {
        ProjectDataService.addManagers(this.id, [this.add.projectManagerInputField]).then((response) => {
          if ('messageType' in response) {
            this.messagePopupData.uxresponse = {
              ...this.messagePopupData.uxresponse,
              ...response,
            };
          }
          this.add.projectManagerInputField = '';
          this.fetchProject()
        });
      }
    },
    removeEditProjectManager(member: { id: string; email: string; name: string }) {
      ProjectDataService.removeManagers(this.id, [member.id]).then((response) => {
        if ('messageType' in response) {
          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response,
          };
        }
        this.fetchProject()
      });
    },
    addEditEngineer() {
      if (this.add.engineerInputField !== '') {
        ProjectDataService.addEngineers(this.id, [this.add.engineerInputField]).then((response) => {
          if ('messageType' in response) {
            this.messagePopupData.uxresponse = {
              ...this.messagePopupData.uxresponse,
              ...response,
            };
          }
          this.add.engineerInputField = '';
          this.fetchProject()
        });
      }
    },
    removeEditEngineer(member: { id: string; email: string; name: string }) {
      ProjectDataService.removeEngineers(this.id, [member.id]).then((response) => {
        if ('messageType' in response) {
          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response,
          };
        }
        this.fetchProject()
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

  <div v-if="add.name" class="w-full">

    <h1 class="text-2xl font-semibold dark:text-white">{{ add.name }}</h1>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Project</p>

    <hr class="my-6 border-gray-200 dark:border-gray-700"/>

    <!-- Project name -->
    <div class="mb-6">
      <label for="project" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Project title
      </label>
      <input
        type="text"
        name="project_name"
        id="project"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        v-model="add.name"
      />
    </div>

    <!-- Project managers -->
    <div class="mb-6">
      <label for="project_manager-add" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Project managers
      </label>
      <div v-if="add.projectManager.length > 0" class="flex flex-wrap gap-2 mb-2">
        <span v-for="(member, index) in add.projectManager" :key="'pm-' + index"
              class="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600">
          {{ member.email }}
          <button @click="removeEditProjectManager(member)" type="button"
                  class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20">
            <span class="sr-only">Remove</span>
            <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
              <path d="M4 4l6 6m0-6l-6 6" />
            </svg>
            <span class="absolute -inset-1" />
          </button>
        </span>
      </div>
      <textarea
        v-model="add.projectManagerInputField"
        @keydown.enter.prevent="addEditProjectManager"
        placeholder="Enter e-mail address and press Enter"
        rows="1"
        name="project_manager-add"
        id="project_manager-add"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      ></textarea>
    </div>

    <!-- Engineers -->
    <div class="mb-8">
      <label for="engineer-add" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Ontology engineers
      </label>
      <div v-if="add.engineer.length > 0" class="flex flex-wrap gap-2 mb-2">
        <span v-for="(member, index) in add.engineer" :key="'eng-' + index"
              class="inline-flex items-center gap-x-0.5 rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600">
          {{ member.email }}
          <button @click="removeEditEngineer(member)" type="button"
                  class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20">
            <span class="sr-only">Remove</span>
            <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
              <path d="M4 4l6 6m0-6l-6 6" />
            </svg>
            <span class="absolute -inset-1" />
          </button>
        </span>
      </div>
      <textarea
        v-model="add.engineerInputField"
        @keydown.enter.prevent="addEditEngineer"
        placeholder="Enter e-mail address and press Enter"
        rows="1"
        name="engineer-add"
        id="engineer-add"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      ></textarea>
    </div>

    <!-- Actions -->
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
