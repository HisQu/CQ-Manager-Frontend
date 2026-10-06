import {mount, RouterLinkStub, type VueWrapper} from '@vue/test-utils'
import {getActivePinia} from 'pinia'
import {vi} from 'vitest'
import {routerKey} from 'vue-router'

type MountArgs<C> = Parameters<typeof mount<C>>

/**
 * Mounts a component with the app-wide plugins it expects (the test's Pinia store,
 * a RouterLink stub and a router mock, available as `$router` and via `useRouter()`).
 * Returns the wrapper and the router mock.
 */
export function mountWithApp<C>(component: C, options: MountArgs<C>[1] = {}) {
  const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn() }
  const wrapper = mount(component, {
    ...options,
    global: {
      plugins: [getActivePinia()!],
      stubs: { RouterLink: RouterLinkStub },
      mocks: { $router: router },
      provide: { [routerKey as symbol]: router },
      ...options?.global,
    },
  } as MountArgs<C>[1])
  return { wrapper, router }
}

/** Payload of the most recent emission of `event`, or undefined if it was never emitted. */
export function lastEmitted(wrapper: VueWrapper<any>, event: string): unknown[] | undefined {
  const calls = wrapper.emitted(event)
  return calls?.[calls.length - 1]
}
