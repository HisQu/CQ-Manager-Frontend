<!--
  * Shows all comments concerning a question
  * allows the user to write a new comment
-->

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {PaperAirplaneIcon, TrashIcon} from "@heroicons/vue/24/solid";
import CommentListItem from "./CommentListItem.vue";
import SubmitButtonWithCallback from "./SubmitButtonWithCallback.vue";
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
          // refetch the competency question to display the new comment
          this.displaySuccess = true

          if (this.timeout !== -100) {
            clearTimeout(this.timeout);
          }

          this.timeout = setTimeout(() => {
            this.displaySuccess = false;
          }, 1000);
          this.$emit('refresh');
        }
      });
    }
  },
  components: {SubmitButtonWithCallback, TrashIcon, CommentListItem, PaperAirplaneIcon},
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
      return this.comments ? this.comments.sort((a:CommentT, b:CommentT)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()) : []
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
  <section aria-labelledby="reviews-heading" class="">
    <div v-if="comments" class="flex flex-col space-y-10 divide-y divide-gray-200 dark:divide-gray-600">
      <CommentListItem v-for="comment in commentsSorted" :key="comment.id" :comment="comment" />
    </div>
    <div class="mt-20 mb-36">
      <textarea rows="3" name="comment" placeholder="Add new comment..." id="comment" v-model="commentText"
                class="dark:bg-gray-700 block w-full rounded-md border-0 py-1.5 dark:text-gray-100 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
      <button type="button"
              @click="comment(commentText, questionId); commentText=''"
              class="float-right inline-flex items-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5"
              :class="displaySuccess ? 'bg-green-600' : 'bg-indigo-600'">
        <PaperAirplaneIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
        Comment
      </button>
    </div>
  </section>
</template>

<style scoped>

</style>