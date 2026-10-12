<script setup lang="ts">
import FilterSelect from "./FilterSelect.vue";
import FilterMultiSelect from "./FilterMultiSelect.vue";
import {CQ_FILTER_OPTIONS, countActiveFilters, CqFilters, normalizeCqFilters} from "../utils/cqFilters.ts";

defineProps<{
  authorOptions: { value: string; label: string }[];
  tagOptions: { value: string; label: string }[];
}>();

const filters = defineModel<CqFilters>({ required: true });
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FilterMultiSelect :label="$t('author')" :placeholder="$t('allAuthors')" v-model="filters.author" :options="authorOptions" />
      <FilterSelect :label="$t('discussion')" v-model="filters.discussion" :options="CQ_FILTER_OPTIONS.discussion" />
      <FilterSelect :label="$t('rating')" v-model="filters.rating" :options="CQ_FILTER_OPTIONS.rating" />
      <FilterMultiSelect :label="$t('type')" :placeholder="$t('anyType')" v-model="filters.type" :options="CQ_FILTER_OPTIONS.type" />
      <FilterMultiSelect :label="$t('tag')" :placeholder="$t('anyTag')" v-model="filters.tag" :options="tagOptions" />
      <FilterSelect :label="$t('sPARQLQuery2')" v-model="filters.sparql" :options="CQ_FILTER_OPTIONS.sparql" />
      <FilterSelect :label="$t('exampleAnswer2')" v-model="filters.exampleAnswer" :options="CQ_FILTER_OPTIONS.exampleAnswer" />
      <FilterSelect :label="$t('consolidation')" v-model="filters.consolidation" :options="CQ_FILTER_OPTIONS.consolidation" />
      <FilterSelect :label="$t('created')" v-model="filters.created" :options="CQ_FILTER_OPTIONS.created" />
      <FilterSelect :label="$t('lastChanged')" v-model="filters.updated" :options="CQ_FILTER_OPTIONS.updated" />
      <FilterSelect :label="$t('lastComment')" v-model="filters.lastComment" :options="CQ_FILTER_OPTIONS.lastComment" />
      <div class="flex items-end">
        <button type="button"
                :disabled="!countActiveFilters(filters)"
                class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-1.5"
                @click="filters = normalizeCqFilters(null)">
          {{ $t('clearFilters') }}
        </button>
      </div>
    </div>
  </div>
</template>
