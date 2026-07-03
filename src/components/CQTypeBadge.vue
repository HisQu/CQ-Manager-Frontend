<script lang="ts">
import { defineComponent } from 'vue';

const TYPE_CLASSES: Record<string, string> = {
  RQ:    'bg-teal-50 text-teal-700 ring-teal-700/10 dark:bg-teal-400/10 dark:text-teal-400 dark:ring-teal-400/30',
  SCQ:   'bg-sky-50 text-sky-700 ring-sky-700/10 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-sky-400/30',
  VCQ:   'bg-emerald-50 text-emerald-700 ring-emerald-700/10 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/30',
  FCQ:   'bg-violet-50 text-violet-700 ring-violet-700/10 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/30',
  RCQ:   'bg-amber-50 text-amber-700 ring-amber-700/10 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/30',
  aRCQ:  'bg-rose-50 text-rose-700 ring-rose-700/10 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/30',
  efRCQ: 'bg-cyan-50 text-cyan-700 ring-cyan-700/10 dark:bg-cyan-400/10 dark:text-cyan-400 dark:ring-cyan-400/30',
  drRCQ: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30',
  rpRCQ: 'bg-lime-50 text-lime-700 ring-lime-700/10 dark:bg-lime-400/10 dark:text-lime-400 dark:ring-lime-400/30',
  MpCQ:  'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-700/10 dark:bg-fuchsia-400/10 dark:text-fuchsia-400 dark:ring-fuchsia-400/30',
};

export default defineComponent({
  name: 'CQTypeBadge',
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  computed: {
    classes(): string {
      return TYPE_CLASSES[this.type] ?? 'bg-gray-50 text-gray-700 ring-gray-700/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/30';
    },
  },
});
</script>

<template>
  <span :class="['inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', classes]">
    {{ type }}
  </span>
</template>
