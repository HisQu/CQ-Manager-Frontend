import {beforeEach, describe, expect, it, vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import ConsolidationDetailView from '../../src/views/ConsolidationDetailView.vue'
import ConsolidationDataService from '../../src/services/ConsolidationDataService'
import CompetencyQuestionDataService from '../../src/services/CompetencyQuestionDataService'
import {mountWithApp} from '../helpers/mount'
import SubmitButtonWithCallback from '../../src/components/SubmitButtonWithCallback.vue'
import {rowCheckbox, visibleQuestions} from '../helpers/table'
import {apiError, ok} from '../helpers/api'
import {makeConsolidation, makeConsolidationQuestion, makeCq, makeGroup, makeProject} from '../fixtures/factories'
import {useStore} from '../../src/store'

vi.mock('../../src/services/ConsolidationDataService', () => ({
  default: { getOne: vi.fn(), addQuestions: vi.fn(), removeQuestions: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))
vi.mock('../../src/services/CompetencyQuestionDataService', () => ({
  default: { getAllForOneProject: vi.fn(), update: vi.fn() },
}))

const project = makeProject({ id: 'p-1' })
const group1 = makeGroup({ id: 'g-1', name: 'Group 1' })
const group2 = makeGroup({ id: 'g-2', name: 'Group 2' })
const cqA = makeCq({ id: 'cq-a', group: group1, question: 'Source A?' })
const cqB = makeCq({ id: 'cq-b', group: group1, question: 'Candidate B?' })
const cqC = makeCq({ id: 'cq-c', group: group2, question: 'Candidate C?' })

function mockConsolidation(permissions: Parameters<typeof ok>[1], ...sources: CompetencyQuestionReducedT[]) {
  vi.mocked(ConsolidationDataService.getOne)
    .mockResolvedValue(ok(consolidationWithSources(...sources), permissions) as any)
}

function hasSaveButton(wrapper: Awaited<ReturnType<typeof mountDetailView>>) {
  return wrapper.findAll('button').some(b => b.text().includes('Save source questions'))
}

function consolidationWithSources(...sources: CompetencyQuestionReducedT[]) {
  return makeConsolidation({ id: 'c-1', project, sourceQuestions: sources.map(makeConsolidationQuestion) })
}

async function mountDetailView() {
  return (await mountDetailViewWithRouter()).wrapper
}

async function mountDetailViewWithRouter() {
  const mounted = mountWithApp(ConsolidationDetailView, { props: { id: 'c-1', projectid: project.id } })
  await flushPromises()
  return mounted
}

async function clickSave(wrapper: Awaited<ReturnType<typeof mountDetailView>>) {
  const button = wrapper.findAll('button').find(b => b.text().includes('Save source questions'))
  if (!button) throw new Error('Save button not rendered')
  await button.trigger('click')
  await flushPromises()
}

describe('ConsolidationDetailView – source questions', () => {
  beforeEach(() => {
    vi.mocked(ConsolidationDataService.getOne)
      .mockResolvedValue(ok(consolidationWithSources(cqA), { permissionsProjectEngineer: true }) as any)
    vi.mocked(CompetencyQuestionDataService.getAllForOneProject).mockResolvedValue(ok([cqA, cqB, cqC]) as any)
    vi.mocked(ConsolidationDataService.addQuestions).mockResolvedValue(ok({}) as any)
    vi.mocked(ConsolidationDataService.removeQuestions).mockResolvedValue(ok({}) as any)
  })

  it('checks the current source questions', async () => {
    const wrapper = await mountDetailView()

    expect(rowCheckbox(wrapper, 'Source A?').element.checked).toBe(true)
    expect(rowCheckbox(wrapper, 'Candidate B?').element.checked).toBe(false)
  })

  it('adds newly checked questions on save', async () => {
    const wrapper = await mountDetailView()

    await rowCheckbox(wrapper, 'Candidate B?').setValue(true)
    await clickSave(wrapper)

    expect(ConsolidationDataService.addQuestions).toHaveBeenCalledWith('c-1', project.id, ['cq-b'])
    expect(ConsolidationDataService.removeQuestions).not.toHaveBeenCalled()
  })

  it('removes unchecked questions on save', async () => {
    const wrapper = await mountDetailView()

    await rowCheckbox(wrapper, 'Source A?').setValue(false)
    await clickSave(wrapper)

    expect(ConsolidationDataService.removeQuestions).toHaveBeenCalledWith('c-1', project.id, ['cq-a'])
    expect(ConsolidationDataService.addQuestions).not.toHaveBeenCalled()
  })

  it('does not change anything when saving without changes', async () => {
    const wrapper = await mountDetailView()

    await clickSave(wrapper)

    expect(ConsolidationDataService.addQuestions).not.toHaveBeenCalled()
    expect(ConsolidationDataService.removeQuestions).not.toHaveBeenCalled()
  })

  it('shows the saved state after saving', async () => {
    const wrapper = await mountDetailView()
    vi.mocked(ConsolidationDataService.getOne)
      .mockResolvedValue(ok(consolidationWithSources(cqA, cqB), { permissionsProjectEngineer: true }) as any)

    await rowCheckbox(wrapper, 'Candidate B?').setValue(true)
    await clickSave(wrapper)

    expect(ConsolidationDataService.getOne).toHaveBeenCalledTimes(2)
    expect(rowCheckbox(wrapper, 'Source A?').element.checked).toBe(true)
    expect(rowCheckbox(wrapper, 'Candidate B?').element.checked).toBe(true)
  })

  it('reports a failed save instead of silently ignoring it', async () => {
    vi.mocked(ConsolidationDataService.addQuestions).mockResolvedValue(apiError('Could not add'))
    const wrapper = await mountDetailView()

    await rowCheckbox(wrapper, 'Candidate B?').setValue(true)
    await clickSave(wrapper)

    expect(document.body.textContent).toContain('Could not add')
  })
})

describe('ConsolidationDetailView – permissions', () => {
  beforeEach(() => {
    vi.mocked(CompetencyQuestionDataService.getAllForOneProject).mockResolvedValue(ok([cqA, cqB, cqC]) as any)
  })

  it.each([
    ['a project engineer', { permissionsProjectEngineer: true }],
    ['a project manager', { permissionsProjectManager: true }],
  ])('lets %s edit the source questions', async (_, permissions) => {
    mockConsolidation(permissions, cqA)
    const wrapper = await mountDetailView()

    expect(hasSaveButton(wrapper)).toBe(true)
    expect(wrapper.findAll('tbody input[type="checkbox"]')).toHaveLength(3)
  })

  it('lets a system admin edit the source questions without project permissions', async () => {
    useStore().user.isSystemAdmin = true
    mockConsolidation({}, cqA)
    const wrapper = await mountDetailView()

    expect(hasSaveButton(wrapper)).toBe(true)
  })

  it('shows only the included questions, without checkboxes, to users who cannot edit', async () => {
    mockConsolidation({}, cqA)
    const wrapper = await mountDetailView()

    expect(hasSaveButton(wrapper)).toBe(false)
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
    expect(visibleQuestions(wrapper)).toEqual(['Source A?'])
  })
})

describe('ConsolidationDetailView – group preselection', () => {
  beforeEach(() => {
    vi.mocked(CompetencyQuestionDataService.getAllForOneProject).mockResolvedValue(ok([cqA, cqB, cqC]) as any)
  })

  it('preselects the group chosen on the CQ dashboard when editing', async () => {
    useStore().cqSelectedGroup = { id: group2.id, name: group2.name }
    mockConsolidation({ permissionsProjectEngineer: true }, cqA)
    const wrapper = await mountDetailView()

    expect(visibleQuestions(wrapper)).toEqual(['Candidate C?'])
  })

  it('does not filter the read-only list by the dashboard group', async () => {
    useStore().cqSelectedGroup = { id: group2.id, name: group2.name }
    mockConsolidation({}, cqA)
    const wrapper = await mountDetailView()

    expect(visibleQuestions(wrapper)).toEqual(['Source A?'])
  })
})

describe('ConsolidationDetailView – deleting', () => {
  beforeEach(() => {
    vi.mocked(CompetencyQuestionDataService.getAllForOneProject).mockResolvedValue(ok([cqA]) as any)
    mockConsolidation({ permissionsProjectEngineer: true }, cqA)
  })

  async function confirmDelete() {
    const mounted = await mountDetailViewWithRouter()
    mounted.wrapper.findComponent(SubmitButtonWithCallback).vm.$emit('modalsuccessclose')
    await flushPromises()
    return mounted
  }

  it('deletes and returns to the CQ dashboard', async () => {
    vi.mocked(ConsolidationDataService.delete).mockResolvedValue(ok({}) as any)

    const { router } = await confirmDelete()

    expect(ConsolidationDataService.delete).toHaveBeenCalledWith('c-1', project.id)
    expect(router.push).toHaveBeenCalledWith('/questions')
  })

  it('stays on the page and reports the error when deleting fails', async () => {
    vi.mocked(ConsolidationDataService.delete).mockResolvedValue(apiError('Could not delete'))

    const { router } = await confirmDelete()

    expect(router.push).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Could not delete')
  })
})
