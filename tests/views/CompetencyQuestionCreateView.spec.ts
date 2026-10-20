import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {enableAutoUnmount, flushPromises} from '@vue/test-utils'
import CompetencyQuestionCreateView from '../../src/views/CompetencyQuestionCreateView.vue'
import FilterSelect from '../../src/components/FilterSelect.vue'
import GroupDataService from '../../src/services/GroupDataService'
import TopicDataService from '../../src/services/TopicDataService'
import CompetencyQuestionDataService from '../../src/services/CompetencyQuestionDataService'
import {useStore} from '../../src/store'
import {mountWithApp} from '../helpers/mount'
import {apiError, ok} from '../helpers/api'
import {makeGroup, makeProject} from '../fixtures/factories'

vi.mock('../../src/services/GroupDataService', () => ({ default: { getAllForOneProjectThatIBelongTo: vi.fn() } }))
vi.mock('../../src/services/TopicDataService', () => ({ default: { getAllForProject: vi.fn() } }))
vi.mock('../../src/services/CompetencyQuestionDataService', () => ({ default: { add: vi.fn() } }))

enableAutoUnmount(afterEach)

const uncatalogued = { id: 't-none', identifier: '#', name: 'Uncatalogued' }
const persons = { id: 't-a', identifier: 'A', name: 'Persons' }

function mountCreate(topic?: string) {
  const router = { push: vi.fn() }
  const { wrapper } = mountWithApp(CompetencyQuestionCreateView, {
    global: {
      mocks: { $router: router, $route: { query: topic ? { topic } : {} } },
      stubs: { TagSelector: true },
    },
  })
  return { wrapper, router }
}

describe('CompetencyQuestionCreateView', () => {
  beforeEach(() => {
    useStore().project = makeProject()
    vi.mocked(CompetencyQuestionDataService.add).mockResolvedValue(ok({}) as any)
    vi.mocked(GroupDataService.getAllForOneProjectThatIBelongTo)
      .mockResolvedValue(ok([{ ...makeGroup(), project: makeProject() }]) as any)
    vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(
      ok([persons, uncatalogued], { permissionsProjectEngineer: true }) as any)
  })

  it('saves a CQ in the catalogue selected in the create form', async () => {
    const { wrapper, router } = mountCreate()
    await flushPromises()
    const catalogue = wrapper.getComponent(FilterSelect)
    expect(catalogue.text()).toContain('# · Uncatalogued')
    await catalogue.get('button').trigger('click')
    await flushPromises()
    const option = catalogue.findAll('[role="option"]').find(option => option.text() === 'A · Persons')!
    await option.trigger('click')
    await wrapper.get('#question').setValue('Who petitioned?')
    await wrapper.findAll('button').find(button => button.text() === 'Add')!.trigger('click')
    await flushPromises()

    expect(CompetencyQuestionDataService.add).toHaveBeenCalledWith(
      'Who petitioned?', expect.any(String), null, expect.objectContaining({ topicId: persons.id }))
    expect(router.push).toHaveBeenCalledWith('/questions/')
  })

  it('preselects the catalogue given in the link', async () => {
    const { wrapper } = mountCreate(persons.id)
    await flushPromises()

    expect(wrapper.getComponent(FilterSelect).text()).toContain('A · Persons')
    await wrapper.vm.save()
    expect(vi.mocked(CompetencyQuestionDataService.add).mock.calls[0][3]).toMatchObject({ topicId: persons.id })
  })

  it.each([undefined, 'unknown-catalogue'])('defaults to uncatalogued for link topic %s', async topic => {
    const { wrapper } = mountCreate(topic)
    await flushPromises()
    expect(wrapper.getComponent(FilterSelect).text()).toContain('# · Uncatalogued')

    await wrapper.vm.save()
    expect(vi.mocked(CompetencyQuestionDataService.add).mock.calls[0][3]).not.toHaveProperty('topicId')
  })

  it('offers no catalogue to other users and ignores the link', async () => {
    vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(ok([persons, uncatalogued]) as any)
    const { wrapper } = mountCreate(persons.id)
    await flushPromises()

    expect(wrapper.findComponent(FilterSelect).exists()).toBe(false)
    await wrapper.vm.save()
    expect(vi.mocked(CompetencyQuestionDataService.add).mock.calls[0][3]).not.toHaveProperty('topicId')
  })

  it('allows system administrators to choose a catalogue', async () => {
    useStore().user.isSystemAdmin = true
    vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(ok([persons, uncatalogued]) as any)
    const { wrapper } = mountCreate(persons.id)
    await flushPromises()

    expect(wrapper.getComponent(FilterSelect).text()).toContain('A · Persons')
    await wrapper.vm.save()
    expect(vi.mocked(CompetencyQuestionDataService.add).mock.calls[0][3]).toMatchObject({ topicId: persons.id })
  })

  it('waits for catalogues before saving a CQ from a catalogue link', async () => {
    let resolveTopics!: (response: any) => void
    vi.mocked(TopicDataService.getAllForProject).mockReturnValueOnce(
      new Promise(resolve => { resolveTopics = resolve }))
    const { wrapper } = mountCreate(persons.id)
    await flushPromises()
    await wrapper.vm.save()
    expect(CompetencyQuestionDataService.add).not.toHaveBeenCalled()

    resolveTopics(ok([persons, uncatalogued], { permissionsProjectEngineer: true }))
    await flushPromises()
    await wrapper.vm.save()
    expect(vi.mocked(CompetencyQuestionDataService.add).mock.calls[0][3]).toMatchObject({ topicId: persons.id })
  })

  it('reloads catalogues and permissions when switching projects', async () => {
    const { wrapper } = mountCreate(persons.id)
    await flushPromises()
    vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(ok([uncatalogued]) as any)
    const nextProject = makeProject()
    useStore().project = nextProject
    await flushPromises()

    expect(TopicDataService.getAllForProject).toHaveBeenLastCalledWith(nextProject.id)
    expect(GroupDataService.getAllForOneProjectThatIBelongTo).toHaveBeenLastCalledWith(nextProject.id)
    expect(wrapper.findComponent(FilterSelect).exists()).toBe(false)
    await wrapper.vm.save()
    expect(vi.mocked(CompetencyQuestionDataService.add).mock.calls[0][3]).not.toHaveProperty('topicId')
  })

  it('reports catalogue loading failures', async () => {
    vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(apiError('Cannot load catalogues'))
    const { wrapper } = mountCreate(persons.id)
    await flushPromises()

    expect(wrapper.vm.messagePopupData.open).toBe(true)
    expect(wrapper.vm.messagePopupData.uxresponse.text).toBe('Cannot load catalogues')
    expect(wrapper.findComponent(FilterSelect).exists()).toBe(false)
  })
})
