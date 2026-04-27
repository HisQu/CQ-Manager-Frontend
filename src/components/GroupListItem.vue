<script lang="ts">
import {defineComponent, PropType} from 'vue';
import IdBadge from "./IdBadge.vue";

export default defineComponent({
  name: "GroupListItem",
  components: {IdBadge},
  props: {
    name: {
      type: String,
      required: true
    },
    members: {
      type: Number,
      required: true
    },
    project: {
      type: Object as PropType<ProjectReducedT>
    },
    group_id: {
      type: String,
      required: true
    }
  },
})
</script>

<template>
  <RouterLink :to="'/groups/' + group_id">
    <div class="dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-10 rounded p-4 text-left">
      <div class="grid grid-cols-2">
        <h3 class="font-bold dark:text-white">{{ name }}</h3>
        <div class="inline-block text-right">
          <span>Group Members: {{ members }}</span>
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ project?.name }}</p>
      <IdBadge :id="group_id" />

    </div>
  </RouterLink>
</template>

<style scoped>

</style>