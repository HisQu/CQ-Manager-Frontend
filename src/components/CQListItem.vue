<script setup lang="ts">
import {computed} from "vue";
import StarComponent from "./StarComponent.vue";
import CQTypeBadge from "./CQTypeBadge.vue";
import TagBadge from "./TagBadge.vue";
import {ChatBubbleLeftIcon} from "@heroicons/vue/20/solid";

const props = defineProps<{
  cq: CompetencyQuestionReducedT;
  projectId?: string;
  cardStyle?: boolean;
  showLastComment?: boolean;
}>();

const isConsolidationResult = computed(() => props.cq.unifiedEntryKind === 'consolidation_result');

const linkTo = computed(() => isConsolidationResult.value
  ? `/consolidations/${props.projectId}/${props.cq.consolidation?.id}`
  : `/questions/${props.cq.id}`);

const sourceCount = computed(() => props.cq.consolidation?.sourceQuestionIds?.length ?? 0);

const unreadComments = computed(() => props.cq.noUnreadComments ?? 0);
const totalComments = computed(() => props.cq.noComments ?? 0);

const lastCommentDate = computed(() => {
  const createdAt = props.cq.lastComment?.createdAt;
  return createdAt ? new Date(createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
});
</script>

<template>
  <RouterLink :to="linkTo" class="block">
    <div class="text-left transition-colors rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600/50"
         :class="[
           cardStyle ? 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 shadow-sm' : '',
           isConsolidationResult ? 'ring-1 ring-inset ring-blue-400/30' : (cq.consolidations?.length ? 'ring-1 ring-inset ring-blue-400/30' : ''),
         ]">

      <div class="flex items-center gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-baseline gap-2 flex-1 min-w-0">
              <span v-if="cq.cqCatalogueIdentifier"
                    class="flex-shrink-0 inline-flex items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-2.5 py-0.5 text-sm font-bold text-white tracking-wide">
                {{ cq.cqCatalogueIdentifier }}
              </span>
              <h3 class="font-semibold text-gray-900 dark:text-white leading-snug min-w-0">{{ cq.question }}</h3>
            </div>
            <div v-if="cq.rating" class="flex-shrink-0 pt-0.5">
              <StarComponent :rating="cq.rating" />
            </div>
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-2">
            <CQTypeBadge v-if="cq.type" :type="cq.type" />

            <!-- Consolidation result badges -->
            <template v-if="isConsolidationResult">
              <span class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                {{ sourceCount }} source question{{ sourceCount !== 1 ? 's' : '' }}
              </span>
            </template>

            <!-- Normal CQ badges -->
            <template v-else>
              <template v-if="cq.consolidations?.length">
                <span v-for="c in cq.consolidations" :key="c.id"
                      :class="c.role === 'target'
                        ? 'inline-flex items-center rounded-md bg-green-50 dark:bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30'
                        : 'inline-flex items-center rounded-md bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30'">
                  {{ c.role === 'target' ? 'Target' : 'Source' }}
                </span>
              </template>
            </template>

            <span v-if="cq.group?.name"
                  class="inline-flex items-center rounded-md bg-violet-50 dark:bg-violet-400/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400 ring-1 ring-inset ring-violet-700/10 dark:ring-violet-400/30">
              {{ cq.group.name }}
            </span>
            <TagBadge v-for="tag in cq.tags" :key="tag.id" :name="tag.name" />
          </div>

          <div v-if="cq.author?.name ?? cq.creator" class="mt-2">
            <span class="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-400/10 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-400/30">
              {{ cq.author?.name ?? cq.creator }}
            </span>
          </div>

          <!-- Last comment, only while it is unread -->
          <div v-if="showLastComment && cq.lastComment"
               class="mt-2 flex items-start gap-2 rounded-md bg-gray-50 dark:bg-gray-900/40 px-2.5 py-1.5 text-sm text-gray-600 dark:text-gray-300">
            <ChatBubbleLeftIcon class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <p class="min-w-0 line-clamp-2">
              <span class="font-medium text-gray-800 dark:text-gray-100">{{ cq.lastComment.author ?? 'Unknown' }}</span>
              <span class="mx-1 text-xs text-gray-400 dark:text-gray-500">{{ lastCommentDate }}</span>
              {{ cq.lastComment.comment }}
            </p>
          </div>
        </div>

        <!-- Comment count: red for unread comments, grey once everything is read -->
        <span v-if="unreadComments"
              :title="`${unreadComments} unread of ${totalComments} comment${totalComments !== 1 ? 's' : ''}`"
              class="flex-shrink-0 inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {{ unreadComments }}
        </span>
        <span v-else-if="totalComments"
              :title="`${totalComments} comment${totalComments !== 1 ? 's' : ''}, all read`"
              class="flex-shrink-0 inline-flex items-center rounded-full bg-gray-200 dark:bg-gray-600 px-2 py-0.5 text-xs font-bold text-gray-700 dark:text-gray-200">
          {{ totalComments }}
        </span>
      </div>

    </div>
  </RouterLink>
</template>
