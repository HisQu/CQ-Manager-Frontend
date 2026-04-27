<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import AddProjectDataService from "../services/ProjectDataService.ts";
import SaveButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/24/solid";

export default{
  name: "ProjectCreateView",
  components: {MessagePopup, ArrowDownOnSquareIcon, SaveButtonWithCallback},
  props: {
    index: {type: String}
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
      add: {
        project: "",
      },

      projectTitle: "",

      projectManagerInputField: '',
      projectManager: [] as string[],

      engineerInputField: '',
      engineer: [] as string[],
    }
  },
  methods: {
    addProjectManager() {
      if (this.projectManagerInputField !== '')
        this.projectManager.push(this.projectManagerInputField)
      this.projectManagerInputField = '';
    },
    removeProjectManager(index: number) {
      this.projectManager.splice(index, 1);
    },
    addEngineer() {
      if (this.engineerInputField !== '')
        this.engineer.push(this.engineerInputField)
      this.engineerInputField = '';
    },
    removeEngineer(index: number) {
      this.engineer.splice(index, 1);
    },

    async save() {
      const response = await AddProjectDataService.add({
        name: this.projectTitle,
        managers: this.projectManager,
        engineers: this.engineer
      });

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        // successful
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
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
    </div>
  </div>

  <div class="content-container">
    <div class="tags-input-container">
      <label for="project-add" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-400">Assign
        project manager:</label>
      <div class="tag-input text-gray-800" v-for="(tag, index) in projectManager" :key="'tag'+ index">
        <span>{{ tag }}</span>
        <button @click="removeProjectManager(index)" class="tag-remove" aria-label="Remove tag">x</button>
      </div>
      <div class="mt-2">
        <textarea v-model="projectManagerInputField" @keydown.enter="addProjectManager"
                  placeholder="Enter e-mail address" rows="1" name="project_add" id="project"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
      </div>
    </div>
    <div class="tags-input-container">
      <label for="project-add" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Assign engineer:
      </label>
      <div class="tag-input text-gray-800" v-for="(tag, index) in engineer" :key="'tag'+ index">
        <span>{{ tag }}</span>
        <button @click="removeEngineer(index)" class="tag-remove" aria-label="Remove tag">x</button>
      </div>
      <div class="mt-2">
        <textarea v-model="engineerInputField" @keydown.enter="addEngineer"
                  placeholder="Enter e-mail address" rows="1" name="project_add" id="project"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
      </div>
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


.tag-input {
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  padding: 5px;
  border-radius: 5px;
  margin-right: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}


.content-container {
  display: flex;
  flex-direction: column;
}

.button-container {
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 1rem;
}


</style>


