<script lang="ts">
import {defineComponent} from 'vue'
import MessagePopup from "../components/MessagePopup.vue";
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {CheckIcon, ChevronDownIcon, ChevronUpDownIcon} from "@heroicons/vue/20/solid"
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import SaveButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/24/solid";
import CompetencyQuestionQueryBuilder from "../components/CompetencyQuestionQueryBuilder.vue";
import GroupDataService from "../services/GroupDataService.ts";
import {useStore} from "../store.ts";

export default defineComponent({
  name: "CompetencyQuestionCreateView",
  components: {
    CompetencyQuestionQueryBuilder, ArrowDownOnSquareIcon, SaveButtonWithCallback, ListboxOption, ListboxOptions, ListboxButton, ListboxLabel, Listbox, MessagePopup, CheckIcon, ChevronDownIcon, ChevronUpDownIcon},

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
      groups: [] as GroupT[],
      selectedGroup: {name: "No Group selected", id: "", project: null as ProjectFullT | null, noMembers: 0, noQuestions: 0, createdAt: "", updatedAt: ""},
      cq: {
        question: "",
      },
      store: useStore(),
    }
  },

  watch: {
    "this.store.getProject"() {
      this.fetchGroups();
    }
  },

  mounted() {
    this.fetchGroups()
  },
  methods: {
    fetchGroups() {
      GroupDataService.getAllForOneProjectThatIBelongTo(this.store.getProject.id).then(response => {
        if ("messageType" in response) {
          console.log("halloo5")

          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response
          };
          this.messagePopupData.open = true;

        } else if (response.data.length === 0) {
          this.messagePopupData.uxresponse = {
            title: "Missing group membership",
            messageType: "warning" as const,
            text: "Unfortunately, you are not assigned to any groups. Please contact the project manager, if you think this is an error.",
            detail: "",
          }
          this.messagePopupData.open = true;

        } else {
          console.log("hallo")
          console.log(response.data)
          this.groups = response.data;
          this.selectedGroup = this.groups[0];
          console.log(this.groups)
        }
      })
    },

    async save() {
      const response = await CompetencyQuestionDataService.add(
        this.cq.question,
        this.selectedGroup.id
      );

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        this.$router.push('/questions/');
      }
    }
  }
})
</script>

<template>
  <div class="w-full">
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="$router.push('/questions/')"/>
    <h1 class="text-2xl">
      Add a new Competency Question
    </h1>

    <Listbox as="div" v-model="selectedGroup">
      <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Assigned to</ListboxLabel>
      <div class="relative mt-2">
        <ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
          <span class="block truncate">{{ selectedGroup.name }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
        </ListboxButton>

        <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <ListboxOption as="template" v-for="g in groups" :key="g.id" :value="g" v-slot="{ active, selected }">
              <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ g.name }} &middot; Project {{g.project.name}}</span>

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
      <label for="question" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">Question text</label>
      <div class="mt-2">
        <textarea v-model="cq.question" rows="4" name="comment" id="question" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>

    <button class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="save()">
      <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
      Add
    </button>
  </div>
</template>

<style scoped>

</style>