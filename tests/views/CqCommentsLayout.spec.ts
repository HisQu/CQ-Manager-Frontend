import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {flushPromises, mount} from '@vue/test-utils'
import {getActivePinia} from 'pinia'
import {createMemoryHistory, createRouter} from 'vue-router'
import App from '../../src/App.vue'
import CompetencyQuestionDetailView from '../../src/views/CompetencyQuestionDetailView.vue'
import CqCommentsPane from '../../src/components/CqCommentsPane.vue'
import Navbar from '../../src/components/Navbar.vue'
import {useStore} from '../../src/store'
import ProjectDataService from '../../src/services/ProjectDataService'
import CompetencyQuestionDataService from '../../src/services/CompetencyQuestionDataService'
import CommentDataService from '../../src/services/CommentDataService'
import TopicDataService from '../../src/services/TopicDataService'
import {makeCq, makeProject} from '../fixtures/factories'
import {ok} from '../helpers/api'

vi.mock('../../src/components/CompetencyQuestionQueryBuilder.vue', () => ({default: {template: '<div />'}}))
vi.mock('../../src/services/ProjectDataService', () => ({default: {getAll: vi.fn()}}))
vi.mock('../../src/services/CompetencyQuestionDataService', () => ({default: {getOne: vi.fn()}}))
vi.mock('../../src/services/CommentDataService', () => ({default: {markRead: vi.fn(), comment: vi.fn()}}))
vi.mock('../../src/services/TopicDataService', () => ({default: {getAllForProject: vi.fn()}}))

let viewportWidth = 1365
let viewportHeight = 800
const mediaListeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>()
function matchesQuery(query: string) {
  const width = Number(query.match(/min-width: (\d+)px/)?.[1] ?? 0)
  const height = Number(query.match(/min-height: (\d+)px/)?.[1] ?? 0)
  return viewportWidth >= width && viewportHeight >= height
}
function resizeLayout(width: number, height = 800) {
  viewportWidth = width
  viewportHeight = height
  for (const [query, listeners] of mediaListeners) {
    for (const listener of listeners) listener({matches: matchesQuery(query)} as MediaQueryListEvent)
  }
}
afterEach(() => vi.unstubAllGlobals())

beforeEach(() => {
  viewportWidth = 1365
  viewportHeight = 800
  mediaListeners.clear()
  vi.stubGlobal('matchMedia', vi.fn((query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>()
    mediaListeners.set(query, listeners)
    return {
      matches: matchesQuery(query),
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
    }
  }))
  useStore().user.loggedInAt = new Date()
  vi.mocked(ProjectDataService.getAll).mockResolvedValue(ok([]))
  vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(ok([]))
  vi.mocked(CommentDataService.markRead).mockResolvedValue(ok({}) as any)
  vi.mocked(CompetencyQuestionDataService.getOne).mockImplementation(async id => ok({
    ...makeCq({id}),
    group: {id: 'g-1', name: 'Research', project: makeProject()},
    comments: [], ratings: [], aggregatedRating: 0, annotations: [], versions: [], versionNumber: 1,
    deletedAt: null,
  }) as any)
})

async function mountLayout() {
  const router = createRouter({history: createMemoryHistory(), routes: [
    {path: '/questions', name: 'questions', component: {template: '<div>Questions dashboard</div>'}},
    {path: '/questions/:id', name: 'question-detail', component: CompetencyQuestionDetailView, props: true},
    {path: '/:pathMatch(.*)*', component: {template: '<div />'}},
  ]})
  await router.push('/questions/q-1')
  await router.isReady()
  const wrapper = mount(App, {global: {
    plugins: [getActivePinia()!, router],
    stubs: {CompetencyQuestionQueryBuilder: true, QuestionHistory: true, TagSelector: true, StarComponent: true},
  }})
  await flushPromises()
  return {wrapper, router}
}

describe('CQ comments layout', () => {
  it('opens comments on entry, collapses the navbar and reserves room for the pane', async () => {
    const {wrapper} = await mountLayout()
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(true)
    expect(wrapper.get('main').classes()).toContain('pr-96')
    expect(wrapper.get('main').classes()).toContain('sm:pl-16')
    expect(useStore().sidebarCollapsed).toBe(false)
    wrapper.unmount()
  })

  it('lets either sidebar expand, preserving an unsent comment when the pane closes', async () => {
    const {wrapper} = await mountLayout()
    await wrapper.get('#new-comment').setValue('Keep this draft')
    await wrapper.get('button[aria-label="Expand sidebar"]').trigger('click')
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(false)
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(wrapper.get('main').classes()).toContain('sm:pl-72')
    await wrapper.get('button[aria-label="Expand comments"]').trigger('click')
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(true)
    expect((wrapper.get('#new-comment').element as HTMLTextAreaElement).value).toBe('Keep this draft')
    wrapper.unmount()
  })

  it('reopens comments for the next CQ and restores the navbar on leaving detail pages', async () => {
    const {wrapper, router} = await mountLayout()
    await wrapper.get('button[aria-label="Collapse comments"]').trigger('click')
    await router.push('/questions/q-2')
    await flushPromises()
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    expect(wrapper.getComponent(CqCommentsPane).props('questionId')).toBe('q-2')
    await router.push('/questions')
    await flushPromises()
    expect(wrapper.findComponent(CqCommentsPane).exists()).toBe(false)
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(wrapper.get('main').classes()).toContain('sm:pl-72')
    wrapper.unmount()
  })

  it('keeps comments inline on small screens without shrinking or covering the CQ', async () => {
    viewportWidth = 1024
    const {wrapper} = await mountLayout()
    expect(wrapper.getComponent(CqCommentsPane).props('docked')).toBe(false)
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(false)
    expect(wrapper.get('main').classes()).not.toContain('pr-96')
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    await wrapper.get('button[aria-label="Expand comments"]').trigger('click')
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(wrapper.get('[data-test="comments-pane"]').classes()).not.toContain('fixed')
    wrapper.unmount()
  })

  it('adapts to resizing without discarding a comment draft', async () => {
    const {wrapper} = await mountLayout()
    await wrapper.get('#new-comment').setValue('Draft across viewport changes')
    resizeLayout(1024)
    await flushPromises()
    expect(wrapper.getComponent(CqCommentsPane).props('docked')).toBe(false)
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(wrapper.get('main').classes()).not.toContain('pr-96')
    resizeLayout(1365)
    await flushPromises()
    expect(wrapper.getComponent(CqCommentsPane).props('docked')).toBe(true)
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    expect((wrapper.get('#new-comment').element as HTMLTextAreaElement).value).toBe('Draft across viewport changes')
    wrapper.unmount()
    expect([...mediaListeners.values()].every(listeners => listeners.size === 0)).toBe(true)
  })

  it('allows both panes to stay open on a large screen and toggle independently', async () => {
    viewportWidth = 1920
    const {wrapper} = await mountLayout()
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(wrapper.get('main').classes()).toContain('sm:pl-72')
    expect(wrapper.get('main').classes()).toContain('pr-96')
    await wrapper.get('button[aria-label="Collapse sidebar"]').trigger('click')
    await wrapper.get('button[aria-label="Expand sidebar"]').trigger('click')
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    await wrapper.get('button[aria-label="Collapse comments"]').trigger('click')
    await wrapper.get('button[aria-label="Expand comments"]').trigger('click')
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(useStore().sidebarCollapsed).toBe(false)
    wrapper.unmount()
  })

  it('collapses and restores the navbar as room for both panes changes', async () => {
    viewportWidth = 1440
    const {wrapper} = await mountLayout()
    await wrapper.get('#new-comment').setValue('Keep my draft')
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    resizeLayout(1439)
    await flushPromises()
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(true)
    expect(wrapper.getComponent(CqCommentsPane).props('expanded')).toBe(true)
    resizeLayout(1440)
    await flushPromises()
    expect(wrapper.getComponent(Navbar).props('forceCollapsed')).toBe(false)
    expect(wrapper.get('main').classes()).toContain('sm:pl-72')
    expect((wrapper.get('#new-comment').element as HTMLTextAreaElement).value).toBe('Keep my draft')
    expect(useStore().sidebarCollapsed).toBe(false)
    wrapper.unmount()
  })

  it('keeps deleted questions read-only in the comments pane', async () => {
    const response = await CompetencyQuestionDataService.getOne('deleted')
    vi.mocked(CompetencyQuestionDataService.getOne).mockResolvedValue({
      ...response, data: {...(response as any).data, deletedAt: '2026-10-01T12:00:00Z'},
    } as any)
    const {wrapper} = await mountLayout()
    expect(wrapper.getComponent(CqCommentsPane).props('readonly')).toBe(true)
    expect(wrapper.find('#new-comment').exists()).toBe(false)
    expect(CommentDataService.markRead).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
