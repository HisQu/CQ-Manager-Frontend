<script lang="ts">
import { t } from '../i18n'

import {defineComponent} from 'vue'
import MessagePopup from "../components/MessagePopup.vue";
import {Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {CheckIcon, ChevronDownIcon, ChevronUpDownIcon} from "@heroicons/vue/20/solid"
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import SaveButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import {ArrowDownOnSquareIcon} from "@heroicons/vue/24/solid";
import CompetencyQuestionQueryBuilder from "../components/CompetencyQuestionQueryBuilder.vue";
import GroupDataService from "../services/GroupDataService.ts";
import TagSelector from "../components/TagSelector.vue";
import {useStore} from "../store.ts"
import CqTypeSelect from "../components/CqTypeSelect.vue";
import FilterSelect from "../components/FilterSelect.vue";
import TopicDataService from "../services/TopicDataService.ts";
import {catalogueName, isUncatalogued} from "../utils/catalogues.ts";

export default defineComponent({
  name: "CompetencyQuestionCreateView",
  components: {
    TagSelector, CqTypeSelect, FilterSelect, CompetencyQuestionQueryBuilder, ArrowDownOnSquareIcon, SaveButtonWithCallback, ListboxOption, ListboxOptions, ListboxButton, ListboxLabel, Listbox, MessagePopup, CheckIcon, ChevronDownIcon, ChevronUpDownIcon},

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
      selectedGroup: {get name() { return t('noGroupSelected') }, id: "", project: null as ProjectFullT | null, noMembers: 0, noQuestions: 0, createdAt: "", updatedAt: ""},
      cq: {
        question: "",
        comment: "",
        reference: "",
        anchor: "",
        exampleAnswer: "",
        type: null as CQType | null,
        tags: [] as TagReducedT[],
      },
      // Only ontology engineers (and system admins) may choose a catalogue; otherwise new CQs are uncatalogued.
      topics: [] as TopicT[],
      selectedTopicId: "",
      canChooseCatalogue: false,
      cataloguesLoading: true,
      store: useStore(),
    }
  },

  computed: {
    // The uncatalogued catch-all first, as the default.
    catalogueOptions(): { value: string; label: string }[] {
      return [...this.topics]
        .sort((a, b) => Number(!isUncatalogued(a)) - Number(!isUncatalogued(b)))
        .map(topic => ({ value: topic.id, label: `${topic.identifier} · ${catalogueName(topic)}` }));
    },
  },

  watch: {
    "store.getProject.id"() {
      this.fetchGroups();
      this.fetchTopics();
    }
  },

  mounted() {
    this.fetchGroups()
    this.fetchTopics()
  },
  methods: {
    fetchGroups() {
      const projectId = this.store.getProject.id;
      this.groups = [];
      this.selectedGroup = { ...this.selectedGroup, id: "", name: t('noGroupSelected') };
      GroupDataService.getAllForOneProjectThatIBelongTo(projectId).then(response => {
        if (projectId !== this.store.getProject.id) return;
        if ("messageType" in response) {
          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response
          };
          this.messagePopupData.open = true;

        } else if (response.data.length === 0) {
          this.messagePopupData.uxresponse = {
            title: t('missingGroupMembership'),
            messageType: "warning" as const,
            text: t('unfortunatelyYouAreNotAssignedToAnyGroupsPleaseContactTheProjectManagerIfYouThinkThis'),
            detail: "",
          }
          this.messagePopupData.open = true;

        } else {
          this.groups = response.data;
          const stored = this.store.cqSelectedGroup;
          const matching = this.groups.find(g => g.id === stored.id);
          this.selectedGroup = matching ?? this.groups[0];
        }
      })
    },

    async fetchTopics() {
      const projectId = this.store.getProject.id;
      this.cataloguesLoading = true;
      this.topics = [];
      this.selectedTopicId = "";
      this.canChooseCatalogue = false;
      const response = await TopicDataService.getAllForProject(projectId);
      if (projectId !== this.store.getProject.id) return;
      this.cataloguesLoading = false;
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
        return;
      }
      this.topics = response.data;
      this.canChooseCatalogue = response.data.permissionsProjectEngineer || this.store.getUser.isSystemAdmin;
      // `?topic=<id>` preselects a catalogue, e.g. when coming from a catalogue's page.
      const requested = this.topics.find(topic => topic.id === this.$route.query.topic);
      this.selectedTopicId = (requested ?? this.topics.find(isUncatalogued))?.id ?? "";
    },

    async save() {
      if (this.cataloguesLoading || !this.selectedGroup.id) return;
      const topic = this.topics.find(t => t.id === this.selectedTopicId);
      const response = await CompetencyQuestionDataService.add(
        this.cq.question,
        this.selectedGroup.id,
        this.cq.comment || null,
        {
          reference: this.cq.reference || null,
          anchor: this.cq.anchor || null,
          exampleAnswer: this.cq.exampleAnswer || null,
          type: this.cq.type || null,
          tagIds: this.cq.tags.map(t => t.id),
          ...(this.canChooseCatalogue && topic && !isUncatalogued(topic) ? { topicId: topic.id } : {}),
        },
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
                  @close="messagePopupData.open = false"/>
    <h1 class="text-2xl">
      {{ $t('addANewCompetencyQuestion') }}
    </h1>

    <Listbox as="div" v-model="selectedGroup">
      <ListboxLabel class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">{{ $t('assignedTo') }}</ListboxLabel>
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
                <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ g.name }} {{ $t('project') }} {{g.project.name}}</span>

                <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>

    <FilterSelect v-if="canChooseCatalogue && catalogueOptions.length" class="mt-5"
                  :label="$t('catalogue')" v-model="selectedTopicId" :options="catalogueOptions" />

    <div class="my-5">
      <label for="question" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">{{ $t('questionText') }}</label>
      <div class="mt-2">
        <textarea v-model="cq.question" rows="4" name="question" id="question" class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>

    <div class="my-5">
      <label for="cq_comment" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">{{ $t('comment') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span></label>
      <div class="mt-2">
        <textarea v-model="cq.comment" rows="3" name="cq_comment" id="cq_comment" :placeholder="$t('additionalNotesOrContext')" class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>

    <div class="my-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <CqTypeSelect v-model="cq.type" />
      <div>
        <label for="cq_reference" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">{{ $t('referenceFundstelle') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span></label>
        <div class="mt-2">
          <input type="text" v-model="cq.reference" id="cq_reference" :placeholder="$t('eGS138')" class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        </div>
      </div>
    </div>

    <div class="my-5">
      <TagSelector v-model="cq.tags"
                   :label="$t('tagsOptional')"
                   :project-id="store.getProject.id"
                   @error="response => { messagePopupData.uxresponse = { ...messagePopupData.uxresponse, ...response }; messagePopupData.open = true; }" />
    </div>

    <div class="my-5">
      <label for="cq_anchor" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">{{ $t('anchorBeleganker') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span></label>
      <div class="mt-2">
        <textarea v-model="cq.anchor" rows="2" id="cq_anchor" :placeholder="$t('sourceTextOrEvidenceFromWhichTheCQWasExtracted')" class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>

    <div class="my-5">
      <label for="cq_example_answer" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900">{{ $t('exampleAnswer') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span></label>
      <div class="mt-2">
        <textarea v-model="cq.exampleAnswer" rows="2" id="cq_example_answer" :placeholder="$t('sampleOrExampleAnswer')" class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      </div>
    </div>

    <button :disabled="cataloguesLoading || !selectedGroup.id"
            class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            @click="save()">
      <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
      {{ $t('add') }}
    </button>
  </div>
</template>

<style scoped>

</style>
