<!--
  * Shows all comments concerning a question
  * allows the user to write a new comment
-->

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {PaperAirplaneIcon} from "@heroicons/vue/24/solid";
import CommentListItem from "./CommentListItem.vue";
import MessagePopup from "./MessagePopup.vue";
import CommentDataService from "../services/CommentDataService.ts";

export default defineComponent({
  name: "CommentComponent",
  emits: ['refresh'],
  methods: {
    async comment(commentText: string, questionId: string) {
      if (this.sending || this.readonly || !commentText.trim()) return;
      this.sending = true;
      try {
        const response = await CommentDataService.comment(commentText, questionId);
        if ("messageType" in response) {
          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response
          };
          this.messagePopupData.open = true;
        } else {
          if (this.commentText === commentText) this.commentText = "";
          this.displaySuccess = true;

          if (this.timeout !== -100) {
            clearTimeout(this.timeout);
          }

          this.timeout = setTimeout(() => {
            this.displaySuccess = false;
          }, 1500);
          this.$emit('refresh');
        }
      } finally {
        this.sending = false;
      }
    }
  },
  components: {CommentListItem, PaperAirplaneIcon, MessagePopup},
  beforeUnmount() {
    clearTimeout(this.timeout);
  },
  props: {
    pane: { type: Boolean, default: false },
    questionId: {
      type: String,
      required: true
    },
    comments: {
      type: Object as PropType<CommentT[]>,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    commentsSorted() {
      return this.comments
        ? [...this.comments].sort((a: CommentT, b: CommentT) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : []
    }
  },
  data() {
    return {
      commentText: "",
      displaySuccess: false,
      sending: false,
      timeout: -100,
      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "" as UXResponse["messageType"],
          text: "",
          detail: "",
        },
        open: false
      }
    }
  }
})
</script>

<template>
  <section :class="pane ? 'flex h-full min-h-0 flex-col' : ''">
    <MessagePopup :uxresponse="messagePopupData.uxresponse" :open="messagePopupData.open" @close="messagePopupData.open = false" />
    <div :class="pane ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain p-5' : ''" data-test="comments-list" :tabindex="pane ? 0 : undefined" :aria-label="$t('comments')">
    <!-- Comment list -->
    <div v-if="comments && comments.length > 0" class="space-y-5">
      <CommentListItem v-for="comment in commentsSorted" :key="comment.id" :comment="comment" />
    </div>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">{{ $t('noCommentsYet') }}</p>

    </div>

    <!-- New comment form -->
    <div v-if="!readonly" :class="['border-t border-gray-200 dark:border-gray-700', pane ? 'shrink-0 bg-white px-5 py-4 dark:bg-gray-800' : 'mt-8 pt-6']">
      <label for="new-comment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('addAComment') }}</label>
      <textarea
        rows="3"
        name="new-comment"
        :placeholder="$t('writeYourComment')"
        id="new-comment"
        v-model="commentText"
        class="block w-full rounded-md border-0 py-1.5 dark:bg-gray-800 dark:text-gray-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
      <div class="mt-3 flex justify-end">
        <button
          type="button"
          @click="comment(commentText, questionId)"
          :disabled="sending || !commentText.trim()"
          class="inline-flex items-center gap-x-1.5 rounded-md px-3.5 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :class="displaySuccess ? 'bg-green-600 hover:bg-green-500' : 'bg-indigo-600 hover:bg-indigo-500'"
        >
          <PaperAirplaneIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
          {{ sending ? $t('sendingComment') : (displaySuccess ? $t('commentSent') : $t('comment')) }}
        </button>
      </div>
    </div>
  </section>
</template>
