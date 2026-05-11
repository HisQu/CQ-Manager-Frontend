<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/vue";
import {CheckIcon, ChevronUpDownIcon} from "@heroicons/vue/20/solid";

type GroupOption = { id: string; name: string };

export default defineComponent({
  name: "QuestionSelectorTable",
  components: {Listbox, ListboxButton, ListboxOption, ListboxOptions, CheckIcon, ChevronUpDownIcon},
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
  },
  data() {
    return {
      selectedIds: [...this.initialSelectedIds] as string[],
      selectedFilterGroup: { id: '', name: 'All groups' } as GroupOption,
    }
  },
  computed: {
    filteredCqs(): CompetencyQuestionReducedT[] {
      if (!this.selectedFilterGroup.id) return this.cqs;
      return this.cqs.filter(cq => (cq.group?.id ?? cq.groupId) === this.selectedFilterGroup.id);
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
    selectedIds(newIds: string[]) {
      this.$emit('selectionChanged', newIds);
    },
    initialSelectedIds(newIds: string[]) {
      this.selectedIds = [...newIds];
    },
    selectedFilterGroup(group: GroupOption) {
      this.$emit('groupChanged', group);
    },
    groups(newGroups: GroupOption[]) {
      if (newGroups.length > 0 && !newGroups.find(g => g.id === this.selectedFilterGroup.id)) {
        this.selectedFilterGroup = newGroups[0];
      }
    },
  },
  methods: {
    toggleAll(checked: boolean) {
      const visibleIds = this.filteredCqs.map(cq => cq.id);
      if (checked) {
        this.selectedIds = [...new Set([...this.selectedIds, ...visibleIds])];
      } else {
        const visibleSet = new Set(visibleIds);
        this.selectedIds = this.selectedIds.filter(id => !visibleSet.has(id));
      }
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
              Select questions using the checkbox at the front.
              <span class="dark:text-blue-300 text-blue-600">Blue</span> rows are already part of another consolidation.
            </p>
          </slot>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0 ml-4">
          <span v-if="selectedIds.length > 0"
                class="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-400/10 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/30">
            {{ selectedIds.length }} selected
          </span>
          <button v-if="$slots.default && selectedIds.length > 0"
                  type="button"
                  @click="handleAction"
                  class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <slot></slot>
          </button>
        </div>
      </div>

      <!-- Group filter -->
      <div v-if="groups.length > 1" class="mt-3">
        <Listbox v-model="selectedFilterGroup">
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
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-800/50">
            <th scope="col" class="relative w-12 px-5">
              <input type="checkbox"
                     class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                     :checked="allSelected"
                     :indeterminate="indeterminate"
                     @change="toggleAll(($event.target as HTMLInputElement).checked)"/>
            </th>
            <th scope="col" class="py-3 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Question</th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Group</th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Author</th>
            <th scope="col" class="relative py-3 pl-3 pr-5"><span class="sr-only">View</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
          <tr v-if="filteredCqs.length === 0">
            <td colspan="5" class="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No questions available.
            </td>
          </tr>
          <tr v-for="cq in filteredCqs" :key="cq.id"
              :class="[
                selectedIds.includes(cq.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-900',
                (cq as any).noConsolidations > 0 && !selectedIds.includes(cq.id) ? 'bg-blue-50 dark:bg-blue-900/20' : '',
              ]">
            <td class="relative w-12 px-5">
              <div v-if="selectedIds.includes(cq.id)"
                   class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div>
              <input type="checkbox"
                     class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                     :value="cq.id"
                     v-model="selectedIds"/>
            </td>
            <td class="py-3.5 pr-3 text-sm"
                :class="selectedIds.includes(cq.id) ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'">
              {{ cq.question }}
            </td>
            <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">{{ cq.group?.name }}</td>
            <td class="px-3 py-3.5 text-sm text-gray-500 dark:text-gray-400">{{ cq.author?.name }}</td>
            <td class="py-3.5 pl-3 pr-5 text-right text-sm">
              <RouterLink :to="`/questions/${cq.group?.id ?? cq.groupId}/${cq.id}`"
                          class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                View
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
</style>
