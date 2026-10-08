import { describe, expect, it } from 'vitest'
import { mountWithApp } from '../helpers/mount'
import LanguageSelector from '../../src/components/LanguageSelector.vue'
import LoginView from '../../src/views/LoginView.vue'
import { setLocale, LOCALE_STORAGE_KEY } from '../../src/i18n'

describe('LanguageSelector', () => {
  it('switches the interface through the selector and remembers the choice', async () => {
    const { wrapper } = mountWithApp(LanguageSelector)
    await wrapper.get('select').setValue('de')
    expect(wrapper.get('select').attributes('aria-label')).toBe('Sprache')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de')
  })

  it('translates a mounted form while preserving its input', async () => {
    const { wrapper } = mountWithApp(LoginView)
    await wrapper.get('#email').setValue('person@example.org')
    setLocale('de')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Melden Sie sich bei Ihrem Konto an')
    expect(wrapper.text()).toContain('Passwort')
    expect((wrapper.get('#email').element as HTMLInputElement).value).toBe('person@example.org')
  })
})
