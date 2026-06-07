<script lang="ts">
import {defineComponent} from 'vue'
import { libravatarUrl } from "../utils/libravatar.ts";

export default defineComponent({
  name: "UserCardSmall",

  props: {
    email: {
      type: String,
    }
  },

  data() {
    return {
      avatarUrl: '' as string,
    }
  },

  watch: {
    email: {
      immediate: true,
      handler(val: string | undefined) {
        if (val) this.avatarUrl = libravatarUrl(val, 64);
      }
    }
  },
})
</script>

<template>
  <a href="#" class="group block flex-shrink-0">
    <div class="flex items-center gap-x-2">
      <img v-if="avatarUrl" :src="avatarUrl" referrerpolicy="no-referrer" class="h-8 w-8 rounded-full flex-shrink-0" :alt="email" />
      <slot></slot>
      <div>
        <p class="font-medium text-gray-700 dark:text-gray-300">{{ email }}</p>
      </div>
    </div>
  </a>
</template>

<style scoped>

</style>
