import {beforeEach, describe, expect, it, vi} from 'vitest'
import {flushPromises, RouterLinkStub} from '@vue/test-utils'
import CompetencyQuestionDetailView from '../../src/views/CompetencyQuestionDetailView.vue'
import CompetencyQuestionDataService from '../../src/services/CompetencyQuestionDataService'
import ConsolidationDataService from '../../src/services/ConsolidationDataService'
import CommentDataService from '../../src/services/CommentDataService'
import TopicDataService from '../../src/services/TopicDataService'
import {mountWithApp} from '../helpers/mount'
import {rowCheckbox} from '../helpers/table'
import {ok} from '../helpers/api'
import {makeConsolidation, makeConsolidationQuestion, makeCq, makeProject} from '../fixtures/factories'

vi.mock('../../src/services/CompetencyQuestionDataService', () => ({default: {getOne: vi.fn(), getAllForOneProject: vi.fn()}}))
vi.mock('../../src/services/ConsolidationDataService', () => ({default: {getOne: vi.fn(), addQuestions: vi.fn(), removeQuestions: vi.fn()}}))
vi.mock('../../src/services/CommentDataService', () => ({default: {markRead: vi.fn()}}))
vi.mock('../../src/services/TopicDataService', () => ({default: {getAllForProject: vi.fn()}}))

const project = makeProject({id: 'p-1'})
const source = makeCq({id: 'cq-source', question: 'Source question?'})
const candidate = makeCq({id: 'cq-candidate', question: 'Candidate question?'})
const target = makeCq({id: 'cq-target', question: 'Consolidated question?'})
const consolidation = makeConsolidation({
  id: 'c-1', project, targetQuestion: makeConsolidationQuestion(target), sourceQuestions: [makeConsolidationQuestion(source)],
})

function mockQuestion(consolidations: ConsolidationT[]) {
  vi.mocked(CompetencyQuestionDataService.getOne).mockResolvedValue(ok({
    ...target,
    group: {id: 'g-1', name: 'Research', project},
    comments: [], ratings: [], aggregatedRating: 0, annotations: [], versions: [], revisions: [], versionNumber: 1,
    consolidations, deletedAt: null,
  }, {permissionsGroupMember: true}) as any)
}

async function mountView() {
  const {wrapper} = mountWithApp(CompetencyQuestionDetailView, {
    props: {id: target.id},
    global: {stubs: {RouterLink: RouterLinkStub, CompetencyQuestionQueryBuilder: true, QuestionHistory: true, TagSelector: true, StarComponent: true, MessagePopup: true}},
  })
  await flushPromises()
  return wrapper
}

describe('CompetencyQuestionDetailView – consolidated CQ', () => {
  beforeEach(() => {
    vi.mocked(CommentDataService.markRead).mockResolvedValue(ok({}) as any)
    vi.mocked(TopicDataService.getAllForProject).mockResolvedValue(ok([]) as any)
    vi.mocked(CompetencyQuestionDataService.getAllForOneProject).mockResolvedValue(ok([source, candidate, target]) as any)
    vi.mocked(ConsolidationDataService.getOne).mockResolvedValue(ok(consolidation, {permissionsProjectEngineer: true}) as any)
    vi.mocked(ConsolidationDataService.addQuestions).mockResolvedValue(ok({}) as any)
  })

  it('shows the source questions of its consolidation below the CQ and saves added sources', async () => {
    mockQuestion([consolidation])
    const wrapper = await mountView()

    expect(ConsolidationDataService.getOne).toHaveBeenCalledWith('c-1', 'p-1')
    expect(wrapper.text()).toContain('Source Questions')
    expect(rowCheckbox(wrapper, 'Source question?').element.checked).toBe(true)
    // The target question cannot be one of its own sources.
    expect(wrapper.findAll('tbody tr').some(row => row.text().includes('Consolidated question?'))).toBe(false)

    await rowCheckbox(wrapper, 'Candidate question?').setValue(true)
    await wrapper.findAll('button').find(button => button.text().includes('Save source questions'))!.trigger('click')
    await flushPromises()
    expect(ConsolidationDataService.addQuestions).toHaveBeenCalledWith('c-1', 'p-1', ['cq-candidate'])
    expect(CompetencyQuestionDataService.getOne).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('shows no source questions for a CQ that is only a source of a consolidation', async () => {
    const other = makeConsolidation({id: 'c-2', project, targetQuestion: makeConsolidationQuestion(candidate)})
    mockQuestion([other])
    const wrapper = await mountView()

    expect(ConsolidationDataService.getOne).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Save source questions')
    wrapper.unmount()
  })
})
