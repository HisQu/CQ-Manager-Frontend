<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale, type Locale } from '../i18n'
const { locale, t } = useI18n()
function changeLanguage(event: Event) {
  setLocale((event.target as HTMLSelectElement).value as Locale)
}
</script>

<template>
  <label class="inline-flex items-center gap-2 text-sm">
    <span class="sr-only">{{ t('language') }}</span>
    <select :value="locale" @change="changeLanguage" :aria-label="t('language')"
            class="rounded-md border-gray-300 bg-white py-1 pl-2 pr-8 text-sm text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
      <option value="en" lang="en">English</option>
      <option value="de" lang="de">Deutsch</option>
    </select>
  </label>
</template>
