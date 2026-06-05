<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import CQListItem from "../components/CQListItem.vue";
import { ArrowDownOnSquareIcon } from "@heroicons/vue/24/solid";
import TopicDataService from "../services/TopicDataService.ts";

export default {
  name: 'TopicDetailView',
  components: { MessagePopup, DetailPageHeader, CQListItem, ArrowDownOnSquareIcon },

  props: {
    projectid: { type: String, required: true },
    id: { type: String, required: true },
  },

  data() {
    return {
      messagePopupData: {
        uxresponse: {
          title: '',
          messageType: '' as UXResponse["messageType"],
          text: '',
          detail: '',
        },
        open: false,
      },
      topic: null as TopicT | null,
      name: '',
    };
  },

  methods: {
    async fetchTopic() {
      const response = await TopicDataService.getOne(this.projectid, this.id);
      if ('messageType' in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.topic = response.data;
        this.name = response.data.name;
      }
    },

    async save() {
      if (!this.name.trim()) {
        this.messagePopupData.uxresponse = {
          title: 'Name required',
          messageType: 'warning',
          text: 'Please enter a catalogue name.',
          detail: '',
        };
        this.messagePopupData.open = true;
        return;
      }

      const response = await TopicDataService.update(this.projectid, this.id, this.name.trim());
      if ('messageType' in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.$router.push('/catalogues');
      }
    },
  },

  mounted() {
    this.fetchTopic();
  },
};
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;" />

  <div v-if="topic" class="w-full">
    <DetailPageHeader :title="topic.identifier + ' · ' + topic.name">
      <template #meta>
        <span class="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
          Identifier: {{ topic.identifier }}
        </span>
        <span v-if="topic.questions" class="ml-1.5 inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-400/10 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/30">
          {{ topic.questions.length }} CQ{{ topic.questions.length !== 1 ? 's' : '' }}
        </span>
      </template>
    </DetailPageHeader>

    <hr class="my-6 border-gray-200 dark:border-gray-700" />

    <div class="mb-6 max-w-xl">
      <label for="topic_name" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Name
      </label>
      <input
        type="text"
        id="topic_name"
        v-model="name"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>

    <div class="flex justify-end mb-10 max-w-xl">
      <button
        type="button"
        class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="save"
      >
        <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Save
      </button>
    </div>

    <div v-if="topic.questions && topic.questions.length > 0">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Linked Competency Questions</h2>
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-3 py-2 space-y-1 max-w-xl">
        <CQListItem v-for="q in topic.questions" :key="q.id" :cq="q" :project-id="projectid" />
      </div>
    </div>
    <div v-else-if="topic.questions" class="text-sm text-gray-500 dark:text-gray-400">
      No competency questions are assigned to this catalogue yet.
    </div>
  </div>
</template>
