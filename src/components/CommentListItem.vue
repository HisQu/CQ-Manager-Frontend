<script lang="ts">
import {defineComponent, PropType} from 'vue'
import { libravatarUrl } from "../utils/libravatar.ts";

export default defineComponent({
  name: "CommentListItem",
  props: {
    comment: {
      type: Object as PropType<CommentT>,
      required: true
    },
  },
  data() {
    return {
      avatarUrl: '' as string,
    }
  },
  computed: {
    formattedDate() {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(this.comment.createdAt));
    },
    initials() {
      return this.comment.author.name
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
  },
  mounted() {
    this.avatarUrl = libravatarUrl(this.comment.author.email, 64);
  },
})
</script>

<template>
  <div class="flex gap-3">
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-400/20 flex items-center justify-center overflow-hidden">
      <img v-if="avatarUrl" :src="avatarUrl" referrerpolicy="no-referrer" class="w-full h-full object-cover" :alt="comment.author.name" />
      <span v-else class="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{{ initials }}</span>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 flex-wrap">
        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ comment.author.name }}</span>
        <time :datetime="comment.createdAt" class="text-xs text-gray-400 dark:text-gray-500">{{ formattedDate }}</time>
      </div>
      <div class="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed" v-html="comment.comment" />
    </div>
  </div>
</template>
