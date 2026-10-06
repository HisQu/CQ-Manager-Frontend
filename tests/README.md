# Frontend tests

Run with `npm test` (once) or `npm run test:watch`. Stack: [Vitest](https://vitest.dev) (reuses `vite.config.ts`),
[Vue Test Utils](https://test-utils.vuejs.org) and jsdom. Test files are type-checked by `npx vue-tsc`.

Tests never reach a backend: `vitest.config.ts` pins `VITE_API_URL` to a dummy URL, and services are mocked.

## Layout

| Folder         | What goes here                                                                  |
|----------------|---------------------------------------------------------------------------------|
| `unit/`        | Pure logic from `src/utils`, `src/constants`, … (no mounting)                   |
| `components/`  | One spec per component in `src/components`, mounted with props                  |
| `views/`       | One spec per view in `src/views`, with its data services mocked                 |
| `services/`    | Request shape of each data service (URL, body), with `httpCommon` mocked        |
| `fixtures/`    | Factories for test data (`makeCq`, `makeGroup`, `makeConsolidation`, …)         |
| `helpers/`     | Shared test utilities (`mountWithApp`, `ok`/`apiError`, table helpers, …)       |
| `setup.ts`     | Runs before every test: fresh Pinia store, empty localStorage, jsdom polyfills  |

Name files `<SourceFileName>.spec.ts`, mirroring `src/`.

## Writing a view or component test

```ts
import {vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import SomeService from '../../src/services/SomeService'
import {mountWithApp} from '../helpers/mount'
import {ok} from '../helpers/api'

// Mock only the service methods the view calls.
vi.mock('../../src/services/SomeService', () => ({ default: { getAll: vi.fn() } }))

it('shows the data', async () => {
  vi.mocked(SomeService.getAll).mockResolvedValue(ok([/* fixtures */]) as any)
  const { wrapper, router } = mountWithApp(SomeView, { props: { id: '1' } })
  await flushPromises() // let the view's fetches resolve
  // assert on wrapper / router.push / SomeService calls
})
```

- `ok(data, { permissionsProjectEngineer: true })` builds a successful response, including the
  permission flags normally added by the `httpCommon` interceptor; `apiError(text)` builds the error branch.
- Set store state with `useStore()` before mounting; each test gets a fresh store.
- Mocks are reset before every test (`mockReset`), so set return values in the test or a `beforeEach`.
