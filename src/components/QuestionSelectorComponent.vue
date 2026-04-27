<script lang="ts">
import {defineComponent, PropType} from 'vue'

export default defineComponent({
  name: "QuestionSelectorComponent",
  props: {
    cqs: {
      type: Object as PropType<CompetencyQuestionReducedT[]>,
      required: true,
    }
  },
  data() {
    return {
      selectedQuestions: [] as string[]
    }
  },
  computed: {
    indeterminate() {
      return this.selectedQuestions.length > 0 && this.selectedQuestions.length < this.cqs.length
    }
  },
  emits: ["selectionWasMade"]
})
</script>

<template>
  <div class="mt-8 flow-root">
    <h3 class="text-xl">Question Selector</h3>
    <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 mb-5">
      Select questions using the checkbox at the front. The <span class="dark:text-blue-300 text-blue-600">blue</span> entries are already consolidated questions.
    </p>
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="relative">
          <div v-if="selectedQuestions.length > 0" class="absolute left-14 top-0 flex h-12 items-center space-x-3 sm:left-12">
            <button type="button" class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                    @click="$emit('selectionWasMade', selectedQuestions)">
              <slot></slot>
            </button>
          </div>
          <table class="min-w-full table-fixed divide-y divide-gray-300">
            <thead>
            <tr>
              <th scope="col" class="relative px-7 sm:w-12 sm:px-6">
                <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" :checked="indeterminate || selectedQuestions.length === cqs.length" :indeterminate="indeterminate" @change="selectedQuestions = ($event.target as HTMLInputElement).checked ? cqs.map((p) => p.id as string) : []" />
              </th>
              <th scope="col" class="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Question</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Group</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Author</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-3">
                <span class="sr-only">Edit</span>
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="cq in cqs" :key="cq.id" :class="[selectedQuestions.includes(cq.id as string) && 'bg-gray-100', (cq as any).noConsolidations > 0 && 'bg-blue-200']">
              <td class="relative px-7 sm:w-12 sm:px-6">
                <div v-if="selectedQuestions.includes(cq.id)" class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div>
                <input type="checkbox" class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" :value="cq.id" v-model="selectedQuestions" />
              </td>
              <td :class="['whitespace-nowrap py-4 pr-3 text-sm font-medium', selectedQuestions.includes(cq.id) ? 'text-indigo-600' : 'text-gray-900']">
                {{ cq.question }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ cq?.group?.name }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 test-sm text-gray-500">
                {{cq?.author.name}}
              </td>
              <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                <RouterLink :to="`/questions/${cq?.group?.id}/${cq.id}`" class="text-indigo-600 hover:text-indigo-900">
                  Edit<span class="sr-only">, {{ cq.question }}</span>
                </RouterLink>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>