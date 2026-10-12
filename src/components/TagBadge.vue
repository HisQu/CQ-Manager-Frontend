<script setup lang="ts">
import {computed} from "vue";
import {tagColorClasses} from "../utils/tagColors.ts";

const props = defineProps<{
  name: string;
  removable?: boolean;
}>();

const emit = defineEmits<{
  remove: [];
}>();

const classes = computed(() => tagColorClasses(props.name));
</script>

<template>
  <span :class="['inline-flex items-center gap-x-0.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', classes]">
    <span aria-hidden="true">#</span>{{ name }}
    <button v-if="removable" type="button"
            class="group relative -mr-1 ml-0.5 h-3.5 w-3.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            @click.stop.prevent="emit('remove')">
      <span class="sr-only">{{ $t('removeTag') }} {{ name }}</span>
      <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-current opacity-60 group-hover:opacity-100">
        <path d="M4 4l6 6m0-6l-6 6" />
      </svg>
      <span class="absolute -inset-1" />
    </button>
  </span>
</template>
