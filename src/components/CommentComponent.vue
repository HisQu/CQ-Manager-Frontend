<!--
  * Shows all comments concerning a question
  * allows the user to write a new comment
-->

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {PaperAirplaneIcon} from "@heroicons/vue/24/solid";
import CommentListItem from "./CommentListItem.vue";
import CommentDataService from "../services/CommentDataService.ts";

export default defineComponent({
  name: "CommentComponent",
  emits: ['refresh'],
  methods: {
    comment(commentText: string, questionId: string) {
      CommentDataService.comment(commentText, questionId).then(response => {
        if ("messageType" in response) {
          this.messagePopupData.uxresponse = {
            ...this.messagePopupData.uxresponse,
            ...response
          };
          this.messagePopupData.open = true;
        } else {
          this.displaySuccess = true;

          if (this.timeout !== -100) {
            clearTimeout(this.timeout);
          }

          this.timeout = setTimeout(() => {
            this.displaySuccess = false;
          }, 1500);
          this.$emit('refresh');
        }
      });
    }
  },
  components: {CommentListItem, PaperAirplaneIcon},
  props: {
    questionId: {
      type: String,
      required: true
    },
    comments: {
      type: Object as PropType<CommentT[]>,
      required: true
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
  <section>
    <!-- Comment list -->
    <div v-if="comments && comments.length > 0" class="space-y-5">
      <CommentListItem v-for="comment in commentsSorted" :key="comment.id" :comment="comment" />
    </div>
    <p v-else class="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>

    <!-- New comment form -->
    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <label for="new-comment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add a comment</label>
      <textarea
        rows="3"
        name="new-comment"
        placeholder="Write your comment…"
        id="new-comment"
        v-model="commentText"
        class="block w-full rounded-md border-0 py-1.5 dark:bg-gray-800 dark:text-gray-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
      <div class="mt-3 flex justify-end">
        <button
          type="button"
          @click="comment(commentText, questionId); commentText = ''"
          :disabled="!commentText.trim()"
          class="inline-flex items-center gap-x-1.5 rounded-md px-3.5 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :class="displaySuccess ? 'bg-green-600 hover:bg-green-500' : 'bg-indigo-600 hover:bg-indigo-500'"
        >
          <PaperAirplaneIcon class="-ml-0.5 h-4 w-4" aria-hidden="true"/>
          {{ displaySuccess ? 'Sent!' : 'Comment' }}
        </button>
      </div>
    </div>
  </section>
</template>
