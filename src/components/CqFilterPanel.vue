<script setup lang="ts">
import FilterSelect from "./FilterSelect.vue";
import {CQ_FILTER_OPTIONS, DEFAULT_CQ_FILTERS, countActiveFilters, CqFilters} from "../utils/cqFilters.ts";

defineProps<{
  authorOptions: { value: string; label: string }[];
}>();

const filters = defineModel<CqFilters>({ required: true });
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FilterSelect label="Author" v-model="filters.author" :options="authorOptions" />
      <FilterSelect label="Discussion" v-model="filters.discussion" :options="CQ_FILTER_OPTIONS.discussion" />
      <FilterSelect label="Rating" v-model="filters.rating" :options="CQ_FILTER_OPTIONS.rating" />
      <FilterSelect label="Type" v-model="filters.type" :options="CQ_FILTER_OPTIONS.type" />
      <FilterSelect label="SPARQL query" v-model="filters.sparql" :options="CQ_FILTER_OPTIONS.sparql" />
      <FilterSelect label="Example answer" v-model="filters.exampleAnswer" :options="CQ_FILTER_OPTIONS.exampleAnswer" />
      <FilterSelect label="Consolidation" v-model="filters.consolidation" :options="CQ_FILTER_OPTIONS.consolidation" />
      <FilterSelect label="Created" v-model="filters.created" :options="CQ_FILTER_OPTIONS.created" />
      <FilterSelect label="Last changed" v-model="filters.updated" :options="CQ_FILTER_OPTIONS.updated" />
      <FilterSelect label="Last comment" v-model="filters.lastComment" :options="CQ_FILTER_OPTIONS.lastComment" />
      <div class="flex items-end">
        <button type="button"
                :disabled="!countActiveFilters(filters)"
                class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-1.5"
                @click="filters = { ...DEFAULT_CQ_FILTERS }">
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>
