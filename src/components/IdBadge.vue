<script lang="ts" setup>
defineProps<{ id: string }>();
</script>

<template>
  <p class="mt-1 font-mono text-xs text-gray-300 select-all">{{ id }}</p>
</template>
