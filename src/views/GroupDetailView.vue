<script lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import EmailChipsInput from "../components/EmailChipsInput.vue";
import { ArrowDownOnSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
import GroupDataService from "../services/GroupDataService.ts";


export default {
  name: "GroupDetailView",
  components: { MessagePopup, ArrowDownOnSquareIcon, SubmitButtonWithCallback, TrashIcon, DetailPageHeader, EmailChipsInput },
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
      data: null as GroupFullT | null,
      name: "",
      members: [] as { id: string; email: string; name: string }[],
    }
  },
  methods: {
    async fetchGroup() {
      const response = await GroupDataService.getOne(this.id);
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.data = response.data;
        this.name = response.data.name as string;
        this.members = response.data.members as { id: string; email: string; name: string }[];
      }
    },
    async saveGroup() {
      const response = await GroupDataService.update(this.id, this.data!.project.id as string, {
        name: this.name,
        emails: this.members.map(m => m.email),
      });
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
        this.messagePopupData.open = true;
      } else {
        this.$router.push('/groups/');
      }
    },
    deleteGroup() {
      GroupDataService.delete(this.id, this.data!.project.id as string).then(response => {
        if ("messageType" in response) {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        } else {
          this.$router.push('/groups/');
        }
      });
    },
    addMember(email: string) {
      GroupDataService.addMembers(this.id, this.data!.project.id as string, [email]).then(response => {
        if ("messageType" in response && response.messageType === 'error') {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        }
        this.fetchGroup();
      });
    },
    removeMember(member: { id?: string; email: string; name?: string }) {
      if (!member.id) return;
      GroupDataService.removeMembers(this.id, this.data!.project.id as string, [member.id]).then(response => {
        if ("messageType" in response && response.messageType === 'error') {
          this.messagePopupData.uxresponse = { ...this.messagePopupData.uxresponse, ...response };
          this.messagePopupData.open = true;
        }
        this.fetchGroup();
      });
    },
  },
  mounted() {
    this.fetchGroup();
  }
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse" :open="messagePopupData.open" @close="messagePopupData.open = false;" />
  <div v-if="data" class="w-full">
    <DetailPageHeader :title="data.name ?? ''" :project="data.project?.name">
      <template #meta>
        <span class="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
          {{ data.noMembers }} member{{ data.noMembers !== 1 ? 's' : '' }}
        </span>
        <span class="ml-1.5 inline-flex items-center rounded-md bg-violet-50 px-1.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-700/10 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/30">
          {{ data.noQuestions }} question{{ data.noQuestions !== 1 ? 's' : '' }}
        </span>
      </template>
    </DetailPageHeader>

    <hr class="my-6 border-gray-200 dark:border-gray-700"/>

    <div class="mb-6">
      <label for="group_name" class="block text-sm font-medium leading-6 dark:text-gray-100 text-gray-900 mb-2">
        Group title
      </label>
      <input
          type="text"
          name="group_name"
          id="group_name"
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          v-model="name"
      />
    </div>

    <div class="mb-8">
      <EmailChipsInput
          :members="members"
          label="Members"
          input-id="group_members"
          @add="addMember"
          @remove="removeMember"
      />
    </div>

    <div class="flex items-center justify-between">
      <SubmitButtonWithCallback
          agree-button-text="Delete the group"
          title="Are you sure you want to delete the group?"
          detail="This action is permanent."
          @modalsuccessclose="deleteGroup"
      >
        <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Delete
      </SubmitButtonWithCallback>

      <button
          type="button"
          class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          @click="saveGroup"
      >
        <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />
        Save
      </button>
    </div>
  </div>
</template>
