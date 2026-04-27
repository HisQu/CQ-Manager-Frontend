<script lang="ts">
import {defineComponent} from 'vue'
import MessagePopup from "../components/MessagePopup.vue";
import {ChevronUpDownIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/vue/20/solid"
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from "@headlessui/vue";
import GroupDataService from "../services/GroupDataService.ts";
import SaveButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/24/solid";
import ProjectDataService from "../services/ProjectDataService";
import {useStore} from "../store.ts";

export default defineComponent({
  name: "GroupCreateView",
  components: {ChevronUpDownIcon, ArrowDownOnSquareIcon, ChevronUpIcon, SaveButtonWithCallback, ListboxOption, ListboxOptions, ListboxButton, ListboxLabel, Listbox, MessagePopup, CheckIcon, ChevronDownIcon},
  
  data() {
    return {
      messagePopupData: {
        uxresponse: {
          title: '',
          messageType: '',
          text: '',
          detail: '',
        },
        open: false,
      },
      add: {
        group: '',
      },
      store: useStore(),
      membersInputField: '',
      members: [] as string[],
      selectedProject: { name: '', id: '' }, 
      projects: [], 
    };
  },
  mounted() {
    ProjectDataService.getAll().then((response) => {
      if ('messageType' in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
      } else {
        this.projects = response.data; 
        this.selectedProject = this.projects[0]; 
        console.log(this.projects);
      }
    });
  },
  methods: {
    addMembers() {
      if (this.membersInputField !== '') {
        this.members.push(this.membersInputField); 
        this.membersInputField = '';
      }
    },
    removeMembers(index: number) {
      this.members.splice(index, 1);
    },
    async save() {
      const response = await GroupDataService.add({
        name: this.add.group,
        members: this.members,
        project_id: this.store.getProject.id,
      });

      if ('messageType' in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response,
        };
        this.messagePopupData.open = true;
      } else {
        // Successful
        this.add.group = response.data.group;

        // Redirect to the groups page
        this.$router.push('/groups/');
      }
    },
  },
});
</script>
<template>
  <div class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>
    <h1 class="text-2xl">
      Add  group
    </h1>

    <Listbox as="div" v-model="selectedProject">
      <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Assigned to project:</ListboxLabel>
      <div class="relative mt-2">
        <ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
          <span class="block truncate">{{ selectedProject.name }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
        </ListboxButton>
        <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <ListboxOption as="template" v-for="p in projects" :key="p.id" :value="p" v-slot="{ active, selected }">
              <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ p.name }}</span>

                <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
    
    <div class="my-5">
      <label for="group" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">Type in group name:</label>
      <div class="mt-2">
        <textarea v-model="add.group" rows="1" name="group" id="group" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>
   
    <div class="content-container">
    <div class="tags-input-container">
        <label for="group-add" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">Assign group member:</label>
        <div class="tag-input dark:text-gray-900" v-for="(tag, index) in members" :key="'tag'+ index">
            <span>{{ tag }}</span>
            <button @click="removeMembers(index)" class= "tag-remove" aria-label= "Remove tag">x</button>
        </div>
        <div class="mt-2">
            <textarea v-model="membersInputField" @keydown.enter="addMembers" 
                      placeholder= "Enter e-mail address and hit Enter" rows="5" name="group" id="group" 
                      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
        </div>
    </div>
    <div class="button-container">
        <SaveButtonWithCallback class="mt-4"
                                agree-button-text="Save this group?"
                                title="Are you sure you want to add this group?"
                                detail="Check for typos."
                                @modalsuccessclose="save()">
            <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
            Save
        </SaveButtonWithCallback>
    </div>
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


