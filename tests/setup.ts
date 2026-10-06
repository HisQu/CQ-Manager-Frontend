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
  localStorage.clear()
  setActivePinia(createPinia())
})
