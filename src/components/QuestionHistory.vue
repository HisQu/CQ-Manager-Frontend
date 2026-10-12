<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {ref, watch} from "vue";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";

const { t, locale } = useI18n();

const props = defineProps<{ questionId: string }>();

const emit = defineEmits<{ error: [response: UXResponse] }>();

const events = ref<QuestionEventT[]>([]);
const loaded = ref(false);

async function fetchHistory() {
  loaded.value = false;
  const response = await CompetencyQuestionDataService.getHistory(props.questionId);
  if ('messageType' in response) {
    emit('error', response);
  } else {
    // Newest first.
    events.value = [...response.data].reverse();
    loaded.value = true;
  }
}

watch(() => props.questionId, fetchHistory, { immediate: true });

// The parent calls this after every saved change of the CQ.
defineExpose({ refresh: fetchHistory });

function describe(event: QuestionEventT): string {
  switch (event.eventType) {
    case 'created': return t('historyCreated');
    case 'revised': return t('historyRevised');
    case 'tag_added': return t('historyTagAdded', { tag: event.tagName });
    case 'tag_removed': return t('historyTagRemoved', { tag: event.tagName });
    case 'catalogue_assigned': return t('historyCatalogueAssigned', { identifier: event.catalogueIdentifier });
    case 'deleted': return t('historyDeleted');
  }
}

function formatDate(createdAt: string): string {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(createdAt));
}
</script>

<template>
  <p v-if="loaded && events.length === 0" class="text-sm text-gray-500 dark:text-gray-400">{{ t('noEntries') }}</p>
  <ul v-else class="space-y-2">
    <li v-for="event in events" :key="event.id" class="flex flex-wrap items-baseline gap-x-2 text-sm dark:text-gray-300">
      <time :datetime="event.createdAt" class="w-40 shrink-0 text-xs text-gray-500 dark:text-gray-400">{{ formatDate(event.createdAt) }}</time>
      <span v-if="event.actor" class="font-medium">{{ event.actor.name }}</span>
      <span v-else class="italic text-gray-500 dark:text-gray-400" :title="$t('historyImportedHint')">{{ $t('historyImported') }}</span>
      <span>{{ describe(event) }}</span>
      <span class="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">v{{ event.versionNumber }}</span>
    </li>
  </ul>
</template>
