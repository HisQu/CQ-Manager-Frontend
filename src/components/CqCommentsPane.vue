<script setup lang="ts">
import {ChatBubbleLeftRightIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon} from '@heroicons/vue/24/outline'
import CommentComponent from './CommentComponent.vue'

defineProps<{
  questionId: string
  comments: CommentT[]
  readonly?: boolean
  docked?: boolean
}>()
const expanded = defineModel<boolean>('expanded', { required: true })
defineEmits<{ refresh: [] }>()
</script>

<template>
  <aside :aria-label="$t('comments')" data-test="comments-pane"
         class="flex flex-col border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
         :class="docked ? ['fixed inset-y-0 right-0 z-40 border-l shadow-lg transition-[width] duration-200', expanded ? 'w-96' : 'w-12'] : 'mb-6 mt-6 w-full overflow-hidden rounded-xl border'">
    <div class="flex h-16 shrink-0 items-center bg-indigo-600 text-white"
         :class="expanded || !docked ? 'justify-between gap-3 px-5' : 'justify-center'">
      <h2 v-show="expanded || !docked" class="flex min-w-0 items-center gap-2 text-base font-semibold">
        <ChatBubbleLeftRightIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
        {{ $t('comments') }}
        <span class="rounded-full bg-indigo-500 px-2 py-0.5 text-xs">{{ comments.length }}</span>
      </h2>
      <button type="button" @click="expanded = !expanded"
              :aria-expanded="expanded" aria-controls="cq-comments-content"
              :aria-label="$t(expanded ? 'collapseComments' : 'expandComments')"
              :title="$t(expanded ? 'collapseComments' : 'expandComments')"
              class="shrink-0 rounded p-1.5 text-indigo-100 hover:bg-indigo-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        <ChevronUpIcon v-if="!docked && expanded" class="h-5 w-5" aria-hidden="true" />
        <ChevronDownIcon v-else-if="!docked" class="h-5 w-5" aria-hidden="true" />
        <ChevronRightIcon v-else-if="expanded" class="h-5 w-5" aria-hidden="true" />
        <ChevronLeftIcon v-else class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <div v-show="expanded" id="cq-comments-content" :class="docked ? 'min-h-0 flex-1' : 'h-[min(32rem,70dvh)]'">
      <CommentComponent :question-id="questionId" :comments="comments" :readonly="readonly" pane @refresh="$emit('refresh')" />
    </div>
    <button v-if="docked && !expanded" type="button" @click="expanded = true"
            :aria-label="$t('expandComments')" aria-expanded="false" aria-controls="cq-comments-content"
            class="flex flex-1 flex-col items-center gap-4 bg-indigo-600 py-5 text-indigo-100 hover:bg-indigo-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white">
      <ChatBubbleLeftRightIcon class="h-5 w-5 shrink-0" aria-hidden="true" />
      <span class="text-sm font-semibold [writing-mode:vertical-rl]">{{ $t('comments') }}</span>
      <span class="rounded-full bg-indigo-500 px-1.5 py-0.5 text-xs">{{ comments.length }}</span>
    </button>
  </aside>
</template>
