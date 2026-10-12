import {config} from '@vue/test-utils'
import {i18n, setLocale} from '../src/i18n'
config.global.plugins = [i18n]

import {beforeEach} from 'vitest'
import {createPinia, setActivePinia} from 'pinia'

// jsdom lacks ResizeObserver, which headlessui's Dialog (MessagePopup) uses.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Every test starts with an empty store and no persisted state.
beforeEach(() => {
  setLocale('en')
  localStorage.clear()
  setActivePinia(createPinia())
})
