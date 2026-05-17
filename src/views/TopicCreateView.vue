<script lang="ts">
import { defineComponent } from 'vue';
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import { ArrowDownOnSquareIcon } from "@heroicons/vue/24/solid";
import TopicDataService from "../services/TopicDataService.ts";
import { useStore } from "../store.ts";

export default defineComponent({
  name: 'TopicCreateView',
  components: { MessagePopup, DetailPageHeader, ArrowDownOnSquareIcon },

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
      name: '',
      identifier: '',
      store: useStore(),
    };
  },

  methods: {
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

      const response = await TopicDataService.add(
        this.store.getProject.id,
        this.name.trim(),
        this.identifier.trim() || undefined,
      );

      if ('messageType' in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.$router.push('/catalogues');
      }
    },
  },
});
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;" />
  <div class="w-full">
    <DetailPageHeader title="Add Catalogue" :project="store.getProject.name" />

    <hr class="my-6 border-gray-200 dark:border-gray-700" />

    <div class="mb-6 max-w-xl">
      <label for="topic_name" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Name
      </label>
      <input
        type="text"
        id="topic_name"
        v-model="name"
        placeholder="e.g. Personen, Identifikation, Namen"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>

    <div class="mb-8 max-w-xl">
      <label for="topic_identifier" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-1">
        Identifier <span class="text-gray-400 font-normal">(optional — assigned automatically if left blank)</span>
      </label>
      <input
        type="text"
        id="topic_identifier"
        v-model="identifier"
        placeholder="e.g. A"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
    </div>

    <div class="flex justify-end max-w-xl">
      <button
        type="button"
        class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="save"
      >
        <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Save
      </button>
    </div>
  </div>
</template>
