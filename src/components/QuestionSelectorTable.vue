<script lang="ts">
import { t } from '../i18n'

import {defineComponent, PropType, ref} from 'vue'
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {ArrowTopRightOnSquareIcon, CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon} from "@heroicons/vue/20/solid";
import CqFilterPanel from "./CqFilterPanel.vue";
import CqFilterButton from "./CqFilterButton.vue";
import CqSortControl from "./CqSortControl.vue";
import FilterMultiSelect from "./FilterMultiSelect.vue";
import {useStore} from "../store.ts";
import {catalogueFilterOptions, matchesCqSearch, normalizeCqFilters, tagFilterOptions, tagsOf, useCqFilters} from "../utils/cqFilters.ts";
import {type CqSort, type CqSortField, DEFAULT_CQ_SORT, sortCqs, toggleCqSort} from "../utils/cqSort.ts";

type GroupOption = { id: string; name: string };

export default defineComponent({
  name: "QuestionSelectorTable",
  components: {
    Listbox, ListboxButton, ListboxOption, ListboxOptions,
    ArrowTopRightOnSquareIcon, CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon,
    CqFilterPanel, CqFilterButton, CqSortControl, FilterMultiSelect,
  },
  props: {
    cqs: {
      type: Object as PropType<CompetencyQuestionReducedT[]>,
      required: true,
    },
    groups: {
      type: Array as PropType<GroupOption[]>,
      default: () => [],
    },
    initialSelectedIds: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    initialGroup: {
      type: Object as PropType<GroupOption | null>,
      default: null,
    },
    // When false, the table is read-only: no checkboxes and no selection UI.
    selectable: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    // Starts from a copy of the CQ dashboard's filters; changes here stay local and do not affect the dashboard.
    return useCqFilters(() => props.cqs, ref(normalizeCqFilters(useStore().cqFilters)));
  },
  data() {
    const store = useStore();
    return {
      selectedIds: [...this.initialSelectedIds] as string[],
      selectedFilterGroup: (this.initialGroup?.id
        ? this.initialGroup
        : { id: '', get name() { return t('allGroups') } }) as GroupOption,
      filterText: store.cqSearchQuery,
      selectedTopicIds: [...store.cqSelectedTopicIds] as string[],
      // The CQs that were sources when the table opened stay pinned, even after they are unchecked.
      pinnedIds: [...this.initialSelectedIds] as string[],
      filtersOpen: false,
      sort: { ...DEFAULT_CQ_SORT } as CqSort,
      // Sortable columns; the sort control next to the filters offers the remaining fields.
      columns: [
        { field: 'catalogue', get label() { return t('iD') }, class: 'px-3' },
        { field: 'question', get label() { return t('question') }, class: 'pr-3' },
        { field: 'group', get label() { return t('group') }, class: 'px-3' },
        { field: 'author', get label() { return t('author') }, class: 'px-3' },
        { field: 'consolidations', get label() { return t('consolidations') }, class: 'px-3' },
      ] as { field: CqSortField; label: string; class: string }[],
    }
  },
  computed: {
    tagOptions() {
      return tagFilterOptions(tagsOf(this.cqs));
    },
    catalogueOptions() {
      return catalogueFilterOptions(this.cqs);
    },
    // Catalogues copied from the dashboard that this list does not contain would otherwise hide everything.
    activeTopicIds(): string[] {
      return this.selectedTopicIds.filter(id => this.catalogueOptions.some(o => o.value === id));
    },
    sourceIds(): Set<string> {
      return new Set([...this.pinnedIds, ...this.selectedIds]);
    },
    // Copies of the sources (checked CQs), shown above the list whatever the filters say.
    // A read-only table only lists the sources anyway, so it has no copies.
    pinnedCqs(): CompetencyQuestionReducedT[] {
      if (!this.selectable) return [];
      return sortCqs(this.cqs.filter(cq => this.sourceIds.has(cq.id)), this.sort);
    },
    // The regular filtered and sorted list; sources appear here too when they match.
    listedCqs(): CompetencyQuestionReducedT[] {
      return sortCqs(this.cqs.filter(this.matchesAllFilters), this.sort);
    },
    // Every CQ shown, once, whether as a pinned copy or in the list.
    filteredCqs(): CompetencyQuestionReducedT[] {
      const listedIds = new Set(this.listedCqs.map(cq => cq.id));
      return [...this.pinnedCqs.filter(cq => !listedIds.has(cq.id)), ...this.listedCqs];
    },
    rows(): { key: string; cq?: CompetencyQuestionReducedT; separator?: boolean }[] {
      const pinned = this.pinnedCqs.map(cq => ({ key: `pinned-${cq.id}`, cq }));
      const listed = this.listedCqs.map(cq => ({ key: cq.id, cq }));
      return pinned.length ? [...pinned, { key: 'separator', separator: true }, ...listed] : listed;
    },
    indeterminate(): boolean {
      const visibleSelected = this.filteredCqs.filter(cq => this.selectedIds.includes(cq.id)).length;
      return visibleSelected > 0 && visibleSelected < this.filteredCqs.length;
    },
    allSelected(): boolean {
      return this.filteredCqs.length > 0 && this.filteredCqs.every(cq => this.selectedIds.includes(cq.id));
    }
  },
  emits: ['selectionWasMade', 'selectionChanged', 'groupChanged'],
  watch: {
    cqs(newCqs: CompetencyQuestionReducedT[]) {
      const validIds = new Set(newCqs.map(q => q.id));
      const filtered = this.selectedIds.filter(id => validIds.has(id));
      if (filtered.length !== this.selectedIds.length) {
        this.selectedIds = filtered;
        this.$emit('selectionChanged', this.selectedIds);
      }
    },
    // Immediate, so the parent knows the initial selection even before the user changes it.
    selectedIds: {
      handler(newIds: string[]) {
        this.$emit('selectionChanged', newIds);
      },
      immediate: true,
    },
    initialSelectedIds(newIds: string[]) {
      this.selectedIds = [...newIds];
      this.pinnedIds = [...newIds];
    },
    selectedFilterGroup(group: GroupOption) {
      this.$emit('groupChanged', group);
    },
    groups(newGroups: GroupOption[]) {
      if (newGroups.length > 0) {
        this.selectedFilterGroup = newGroups.find(g => g.id === this.selectedFilterGroup.id) ?? newGroups[0];
      }
    },
  },
  methods: {
    matchesAllFilters(cq: CompetencyQuestionReducedT): boolean {
      if (this.selectedFilterGroup.id && (cq.group?.id ?? cq.groupId) !== this.selectedFilterGroup.id) return false;
      if (this.activeTopicIds.length && !(cq.topic && this.activeTopicIds.includes(cq.topic.id))) return false;
      return this.matchesFilters(cq) && matchesCqSearch(cq, this.filterText);
    },
    toggleAll(checked: boolean) {
      const visibleIds = this.filteredCqs.map(cq => cq.id);
      if (checked) {
        this.selectedIds = [...new Set([...this.selectedIds, ...visibleIds])];
      } else {
        const visibleSet = new Set(visibleIds);
        this.selectedIds = this.selectedIds.filter(id => !visibleSet.has(id));
      }
    },
    sortBy(field: CqSortField) {
      this.sort = toggleCqSort(this.sort, field);
    },
    ariaSort(field: CqSortField): 'ascending' | 'descending' | 'none' {
      if (this.sort.field !== field) return 'none';
      return this.sort.direction === 'asc' ? 'ascending' : 'descending';
    },
    clearSelection() {
      this.selectedIds = [];
    },
    handleAction() {
      this.$emit('selectionWasMade', this.selectedIds.slice());
      this.clearSelection();
    }
  }
})
</script>

<template>
  <div class="rounded-lg ring-1 ring-gray-200 dark:ring-gray-700">
    <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <slot name="header">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('selectQuestionsUsingTheCheckboxAtTheFront') }}
              <span class="dark:text-blue-300 text-blue-600">{{ $t('blue2') }}</span> {{ $t('rowsAreAlreadyPartOfAnotherConsolidation') }}
            </p>
          </slot>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0 ml-4">
          <span v-if="selectable && selectedIds.length > 0"
                class="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-400/10 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
            {{ selectedIds.length }} {{ $t('selected') }}
          </span>
          <button v-if="selectable && $slots.default && selectedIds.length > 0"
                  type="button"
                  @click="handleAction"
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <slot></slot>
          </button>
        </div>
      </div>

      <!-- Text filter -->
      <div class="mt-3">
        <input
          v-model="filterText"
          type="text"
          :placeholder="$t('searchQuestions')"
          class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
      </div>

      <div class="mt-2 flex items-center gap-2">
        <!-- Group filter -->
        <Listbox v-if="groups.length > 1" v-model="selectedFilterGroup" by="id">
          <div class="relative">
            <ListboxButton class="relative w-56 cursor-default rounded-md bg-white dark:bg-gray-800 py-1.5 pl-3 pr-10 text-left text-xs text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span class="block truncate">{{ selectedFilterGroup.name }}</span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon class="h-4 w-4 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>
            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <ListboxOptions class="absolute z-10 mt-1 max-h-48 w-56 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none">
                <ListboxOption as="template" v-for="g in groups" :key="g.id" :value="g" v-slot="{ active, selected }">
                  <li :class="[active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100', 'relative cursor-default select-none py-1.5 pl-3 pr-9 text-xs']">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ g.name }}</span>
                    <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-3']">
                      <CheckIcon class="h-4 w-4" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
        <CqSortControl v-model="sort" size="sm" />
        <CqFilterButton v-model="filtersOpen" :active-count="activeFilterCount + (activeTopicIds.length ? 1 : 0)" />
      </div>

      <div v-if="filtersOpen" class="mt-3 space-y-3">
        <FilterMultiSelect v-if="catalogueOptions.length" class="max-w-sm" :label="$t('catalogue')" :placeholder="$t('allCatalogues')"
                           v-model="selectedTopicIds" :options="catalogueOptions" />
        <CqFilterPanel v-model="filters" :author-options="authorOptions" :tag-options="tagOptions" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-800/50">
            <th v-if="selectable" scope="col" class="relative w-12 px-5">
              <input type="checkbox"
                     class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                     :checked="allSelected"
                     :indeterminate="indeterminate"
                     @change="toggleAll(($event.target as HTMLInputElement).checked)"/>
            </th>
            <th v-for="column in columns" :key="column.field" scope="col" :aria-sort="ariaSort(column.field)"
                :class="[column.class, 'py-3 text-left']">
              <button type="button"
                      :data-test="`sort-${column.field}`"
                      :class="['group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-gray-900 dark:hover:text-white',
                               sort.field === column.field ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400']"
                      @click="sortBy(column.field)">
                {{ column.label }}
                <span :class="['rounded', sort.field === column.field ? 'bg-gray-200 dark:bg-gray-700' : 'invisible group-hover:visible']">
                  <ChevronUpIcon v-if="sort.field === column.field && sort.direction === 'asc'" class="h-4 w-4" aria-hidden="true" />
                  <ChevronDownIcon v-else class="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </th>
            <th scope="col" class="relative py-3 pl-3 pr-5"><span class="sr-only">{{ $t('open') }}</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr v-if="filteredCqs.length === 0">
            <td :colspan="selectable ? 7 : 6" class="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              {{ $t('noQuestionsAvailable') }}
            </td>
          </tr>
          <template v-for="row in rows" :key="row.key">
            <!-- Separates the copies of the sources above from the regular list below -->
            <tr v-if="row.separator" aria-hidden="true" data-test="sources-separator">
              <td :colspan="selectable ? 7 : 6" class="px-0 py-2">
                <div class="h-0.5 bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_2px_rgba(59,130,246,0.55)]"></div>
              </td>
            </tr>
            <tr v-else
                :class="selectable && selectedIds.includes(row.cq!.id)
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : row.cq!.noConsolidations && row.cq!.noConsolidations > 0
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-white dark:bg-gray-900'">
              <td v-if="selectable" class="relative w-12 px-5">
                <div v-if="selectedIds.includes(row.cq!.id)"
                     class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div>
                <input type="checkbox"
                       class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                       :value="row.cq!.id"
                       v-model="selectedIds"/>
              </td>
              <td class="px-3 py-3.5 text-sm whitespace-nowrap">
                <span v-if="row.cq!.cqCatalogueIdentifier"
                      class="inline-flex items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-2 py-0.5 text-xs font-bold text-white tracking-wide">
                  {{ row.cq!.cqCatalogueIdentifier }}
                </span>
              </td>
              <td data-test="question" class="py-3.5 pr-3 text-sm"
                  :class="selectable && selectedIds.includes(row.cq!.id) ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'">
                {{ row.cq!.question }}
              </td>
              <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">{{ row.cq!.group?.name }}</td>
              <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">{{ row.cq!.author?.name }}</td>
              <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                <span v-if="row.cq!.noConsolidations && row.cq!.noConsolidations > 0"
                      class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                  {{ row.cq!.noConsolidations }}
                </span>
                <span v-else class="text-gray-300 dark:text-gray-600">—</span>
              </td>
              <td class="py-3.5 pl-3 pr-5 text-right text-sm">
                <RouterLink :to="`/questions/${row.cq!.id}`"
                            :title="$t('openQuestion', { question: row.cq!.cqCatalogueIdentifier ?? $t('thisCQ') })"
                            class="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-300 dark:ring-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700">
                  {{ $t('openCQ') }}
                  <ArrowTopRightOnSquareIcon class="h-4 w-4" aria-hidden="true" />
                </RouterLink>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
</style>
