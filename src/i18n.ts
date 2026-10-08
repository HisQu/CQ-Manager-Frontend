import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import en from './locales/en.json'
import de from './locales/de.json'

export const LOCALE_STORAGE_KEY = 'cq-manager-locale'
export type Locale = 'en' | 'de'
export const supportedLocales: Locale[] = ['en', 'de']

export function resolveLocale(saved: string | null, languages: readonly string[]): Locale {
  if (saved === 'en' || saved === 'de') return saved
  for (const language of languages) {
    const locale = language.toLowerCase().split('-')[0]
    if (locale === 'en' || locale === 'de') return locale
  }
  return 'en'
}

function initialLocale(): Locale {
  let saved: string | null = null
  try { saved = localStorage.getItem(LOCALE_STORAGE_KEY) } catch { /* Storage may be disabled. */ }
  return resolveLocale(saved, typeof navigator === 'undefined' ? [] : navigator.languages)
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale(),
  fallbackLocale: 'en',
  messages: { en, de },
})

// Used by services and shared label descriptors outside component setup.
export const t = i18n.global.t.bind(i18n.global)

watch(i18n.global.locale, (locale) => {
  if (typeof document !== 'undefined') document.documentElement.lang = locale
  try { localStorage.setItem(LOCALE_STORAGE_KEY, locale) } catch { /* Keep in-memory switching available. */ }
}, { immediate: true, flush: 'sync' })

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
}
