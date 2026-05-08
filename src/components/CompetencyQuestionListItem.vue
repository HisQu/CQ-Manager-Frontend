<script lang="ts">
import {defineComponent} from 'vue'

import { StarIcon } from '@heroicons/vue/24/solid'
import StarComponent from "./StarComponent.vue";
import UserCardSmall from "./UserCardSmall.vue";
import IdBadge from "./IdBadge.vue";

export default defineComponent({
  name: "CompetencyQuestionListItem",

  props: {
    text: {
      type: String,
      required: true
    },
    creator: {
      type: String,
    },
    identifier: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
    },
    cardStyle: {
      type: Boolean,
      required: false
    },
    groupIdentifier: {
      type: String,
      required: true,
    },
    numberOfConsolidations: {
      type: Number,
      required: false,
    }
  },

  components: {UserCardSmall, StarComponent, StarIcon, IdBadge}
})
</script>

<template>

  <RouterLink :to="'/questions/' + groupIdentifier + '/' + identifier">
    <div class="text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-600/50"
         :class="[
           cardStyle ? 'bg-gray-100 rounded-lg p-4 dark:bg-gray-700 dark:text-gray-200 mt-4 shadow-sm' : 'py-3',
           numberOfConsolidations ? 'ring-1 ring-inset ring-blue-400/30' : '',
         ]">

      <div class="flex items-start justify-between gap-4">
        <h3 class="font-semibold text-gray-900 dark:text-white leading-snug flex-1">{{ text }}</h3>
        <div v-if="rating" class="flex-shrink-0 pt-0.5">
          <StarComponent :rating="rating" />
        </div>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-2">
        <span v-if="numberOfConsolidations"
              class="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
          In {{ numberOfConsolidations }} consolidation(s)
        </span>
        <IdBadge :id="identifier" />
        <UserCardSmall v-if="creator" :name="creator" />
      </div>

    </div>
  </RouterLink>

</template>

<style scoped>

</style>