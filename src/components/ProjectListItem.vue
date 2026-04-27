<script lang="ts">
import { defineComponent } from 'vue';
import IdBadge from "./IdBadge.vue";

export default defineComponent({
  name: "ProjectListItem",
  components: {IdBadge},
  props: {
    name: {
      type: String,
      required: true
    },
    engineers: {
      type: Number,
      required: false
    },
    managers: {
      type: Number,
      required: false
    },
    project_id: {
      type: String,
      required: true
    }
},
})
</script>

<template>
  <RouterLink :to="'/projects/' + project_id">
    <div key="project-list-item" class="dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-10 rounded p-4 text-left">
      <div class="grid grid-cols-2">
        <h3 class="font-bold dark:text-white">{{ name }}</h3>
        <div class="inline-block text-right">
          <span>Project Manager(s): {{ managers }}</span>

        </div>
      </div>

      <IdBadge :id="project_id" />
    </div>
  </RouterLink>
</template>

<style scoped>

</style>