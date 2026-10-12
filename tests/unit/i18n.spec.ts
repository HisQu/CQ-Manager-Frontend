import { describe, expect, it, vi } from 'vitest'
import { nextTick, computed } from 'vue'
import { resolveLocale, setLocale, i18n, t, LOCALE_STORAGE_KEY } from '../../src/i18n'
import en from '../../src/locales/en.json'
import de from '../../src/locales/de.json'
import { CQ_FILTER_OPTIONS } from '../../src/utils/cqFilters'
import { CQ_TYPE_LABELS } from '../../src/constants/cqTypes'

describe('internationalization', () => {
  it('prefers a saved language and recognizes regional browser languages', () => {
    expect(resolveLocale('en', ['de-DE'])).toBe('en')
    expect(resolveLocale(null, ['de-AT', 'en-US'])).toBe('de')
    expect(resolveLocale('fr', ['fr-FR', 'en-GB'])).toBe('en')
    expect(resolveLocale(null, ['fr-FR'])).toBe('en')
  })

  it('persists language changes and updates the document language', () => {
    setLocale('de')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de')
    expect(document.documentElement.lang).toBe('de')
  })

  it('switches shared labels reactively without changing filter values or CQ codes', async () => {
    const label = computed(() => CQ_FILTER_OPTIONS.discussion[1].label)
    expect(label.value).toBe('With comments')
    setLocale('de')
    await nextTick()
    expect(label.value).toBe('Mit Kommentaren')
    expect(CQ_FILTER_OPTIONS.discussion[1].value).toBe('with')
    expect(CQ_TYPE_LABELS.RQ).toBe('Literatur')
  })

  it('uses German plural forms and interpolates counts', () => {
    setLocale('de')
    expect(t('sourceQuestionCount', 1)).toBe('1 Quellfrage')
    expect(t('sourceQuestionCount', 2)).toBe('2 Quellfragen')
    expect(t('memberCount', 0)).toBe('0 Mitglieder')
    expect(t('competencyQuestions')).toBe('Competency Questions')
    expect(t('cqCount', 1)).toBe('1 Competency Question')
    expect(t('cqCount', 2)).toBe('2 Competency Questions')
    expect(t('unreadCommentsCount', { unread: 2, count: 3 }, 3)).toBe('2 ungelesen von 3 Kommentaren')
  })

  it('has matching dictionaries and valid message syntax in both languages', () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort())
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      for (const locale of ['en', 'de'] as const) {
        setLocale(locale)
        for (const key of Object.keys(en)) {
          expect(i18n.global.te(key, locale)).toBe(true)
          expect(t(key, { count: 2, unread: 1, questions: '2', groups: '1', field: 'Name', direction: 'A → Z', label: 'Name', question: 'CQ1', engineers: 'A', experts: 'B', action: 'test', detail: 'test' }, 2)).not.toBe('')
        }
      }
      expect(error).not.toHaveBeenCalled()
      expect(warn).not.toHaveBeenCalled()
    } finally { error.mockRestore(); warn.mockRestore() }
  })
})
