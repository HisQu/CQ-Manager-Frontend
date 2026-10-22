<script lang="ts">
import {defineComponent, PropType} from 'vue'
import { libravatarUrl } from "../utils/libravatar.ts";
import {EnvelopeIcon} from "@heroicons/vue/20/solid";

export default defineComponent({
  name: "CommentListItem",
  components: {EnvelopeIcon},
  emits: ['markUnread'],
  props: {
    // Only the latest comment of another user can be marked as unread.
    canMarkUnread: { type: Boolean, default: false },
    markedUnread: { type: Boolean, default: false },
    comment: {
      type: Object as PropType<CommentT>,
      required: true
    },
  },
  computed: {
    avatarUrl() {
      return libravatarUrl(this.comment.author.email, 64);
    },
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
        <span v-if="markedUnread"
              class="ml-auto inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{{ $t('unread') }}</span>
        <button v-else-if="canMarkUnread" type="button" @click="$emit('markUnread')"
                :title="$t('markAsUnread')" :aria-label="$t('markAsUnread')"
                class="ml-auto rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700 dark:hover:text-indigo-300">
          <EnvelopeIcon class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div class="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed" v-html="comment.comment" />
    </div>
  </div>
</template>
