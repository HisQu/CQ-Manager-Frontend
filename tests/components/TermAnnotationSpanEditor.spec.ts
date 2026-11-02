import {afterEach, describe, expect, it, vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import TermAnnotationSpanEditor from '../../src/components/TermAnnotationSpanEditor.vue'
import TermDataService from '../../src/services/TermDataService'
import {apiError, ok} from '../helpers/api'
import {mountWithApp} from '../helpers/mount'

vi.mock('../../src/services/TermDataService', () => ({default: {
  getAllForOneProject: vi.fn(),
  createTerm: vi.fn(),
  proposeAnnotations: vi.fn(),
  reviewAnnotationProposals: vi.fn(),
  saveAnnotationVersion: vi.fn(),
}}))

const question = 'Welche Pfründe erhielt der Petent?'
const editor = {id: 'u-1', email: 'u@example.org', name: 'User'}
const revisions: QuestionRevisionT[] = [{
  id: 'r-1', questionString: question, sparqlQuery: null, exampleAnswer: null, versionNumber: 1, editor,
  annotationVersions: [{
    id: 'av-1', versionNumber: 1, retainedFromAnnotationVersionId: null, editor, annotations: [],
  }],
}]

function mountEditor() {
  vi.mocked(TermDataService.getAllForOneProject).mockResolvedValue(ok([]) as any)
  return mountWithApp(TermAnnotationSpanEditor, {
    props: {
      text: question,
      revisions,
      selectedRevisionId: 'r-1',
      selectedAnnotationVersionId: 'av-1',
      canEdit: true,
      questionTextChanged: false,
      questionId: 'q-1',
      projectId: 'p-1',
    },
  }).wrapper
}

async function stageNewTerm(wrapper: ReturnType<typeof mountEditor>) {
  await wrapper.findAll('button').find((button) => button.text() === 'Edit')!.trigger('click')

  const source = wrapper.get('[data-annotation-source="true"]').element.firstChild!
  const range = document.createRange()
  range.setStart(source, question.indexOf('Pfründe'))
  range.setEnd(source, question.indexOf('Pfründe') + 'Pfründe'.length)
  const selection = window.getSelection()!
  selection.removeAllRanges()
  selection.addRange(range)
  await wrapper.get('.annotation-text').trigger('mouseup')

  await wrapper.get('input').setValue('New glossary term')
  await flushPromises()
  const createOption = wrapper.findAll('li').find((item) => item.text().includes('Create term'))
  expect(createOption).toBeDefined()
  await createOption!.trigger('click')
  await wrapper.findAll('button').find((button) => button.text() === 'Add annotation')!.trigger('click')
  await flushPromises()
}

describe('TermAnnotationSpanEditor glossary term staging', () => {
  afterEach(() => {
    vi.clearAllMocks()
    window.getSelection()?.removeAllRanges()
  })

  it('creates a new glossary term only when the staged annotation set is confirmed', async () => {
    vi.mocked(TermDataService.saveAnnotationVersion).mockResolvedValue(ok({}) as any)
    const wrapper = mountEditor()
    await flushPromises()
    await stageNewTerm(wrapper)

    expect(TermDataService.createTerm).not.toHaveBeenCalled()
    expect(TermDataService.saveAnnotationVersion).not.toHaveBeenCalled()

    await wrapper.findAll('button').find((button) => button.text() === 'Save')!.trigger('click')
    await flushPromises()

    expect(TermDataService.createTerm).not.toHaveBeenCalled()
    expect(TermDataService.saveAnnotationVersion).toHaveBeenCalledWith('q-1', 'r-1', 'av-1', [
      {
        term: 'New glossary term',
        passage: 'Pfründe',
        start: question.indexOf('Pfründe'),
        end: question.indexOf('Pfründe') + 'Pfründe'.length,
        definition: null,
        conceptIri: null,
      },
    ], null)
    expect(TermDataService.getAllForOneProject).toHaveBeenCalledTimes(2)
    expect(wrapper.emitted('updated')).toHaveLength(1)
    wrapper.unmount()
  })

  it('discards a new term without sending either glossary or annotation writes', async () => {
    const wrapper = mountEditor()
    await flushPromises()
    await stageNewTerm(wrapper)

    await wrapper.findAll('button').find((button) => button.text() === 'Discard')!.trigger('click')

    expect(TermDataService.createTerm).not.toHaveBeenCalled()
    expect(TermDataService.saveAnnotationVersion).not.toHaveBeenCalled()
    expect(TermDataService.getAllForOneProject).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('keeps staged edits after the annotation save fails', async () => {
    vi.mocked(TermDataService.saveAnnotationVersion).mockResolvedValue(apiError('Could not save'))
    const wrapper = mountEditor()
    await flushPromises()
    await stageNewTerm(wrapper)
    await wrapper.findAll('button').find((button) => button.text() === 'Save')!.trigger('click')
    await flushPromises()

    expect(TermDataService.createTerm).not.toHaveBeenCalled()
    expect(TermDataService.getAllForOneProject).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('New glossary term')
    expect(wrapper.text()).toContain('Could not save')
    wrapper.unmount()
  })

  it('stages generated proposals and submits their run with the confirmed annotation snapshot', async () => {
    vi.mocked(TermDataService.proposeAnnotations).mockResolvedValue(ok({
      questionId: 'q-1',
      revisionId: 'r-1',
      proposalRunId: 'run-1',
      matcher: {},
      contextMatcher: {},
      candidates: [{
        proposalId: 'proposal-1',
        text: 'Pfründe',
        start: question.indexOf('Pfründe'),
        end: question.indexOf('Pfründe') + 'Pfründe'.length,
        lemma: 'Pfründe',
        rule: 'noun_chunk',
        tokens: [{text: 'Pfründe', lemma: 'Pfründe', pos: 'NOUN', tag: 'NN'}],
        matchStatus: 'none',
        matches: [],
        suggestedTerm: {id: null, content: 'Pfründe', definition: null, conceptIri: null, isNew: true},
      }],
    }) as any)
    vi.mocked(TermDataService.saveAnnotationVersion).mockResolvedValue(ok({}) as any)
    const wrapper = mountEditor()
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Propose')!.trigger('click')
    await flushPromises()

    expect(TermDataService.proposeAnnotations).toHaveBeenCalledWith('p-1', 'q-1', 'r-1', question, true)
    expect(wrapper.text()).toContain('Pfründe')
    expect(TermDataService.saveAnnotationVersion).not.toHaveBeenCalled()

    await wrapper.findAll('button').find((button) => button.text() === 'Save')!.trigger('click')
    await flushPromises()

    expect(TermDataService.saveAnnotationVersion).toHaveBeenCalledWith('q-1', 'r-1', 'av-1', [
      {
        term: 'Pfründe', passage: 'Pfründe',
        start: question.indexOf('Pfründe'), end: question.indexOf('Pfründe') + 'Pfründe'.length,
        definition: null, conceptIri: null,
      },
    ], 'run-1')
    expect(TermDataService.reviewAnnotationProposals).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('records a generated proposal as rejected when the editing session is discarded', async () => {
    vi.mocked(TermDataService.proposeAnnotations).mockResolvedValue(ok({
      questionId: 'q-1', revisionId: 'r-1', proposalRunId: 'run-2',
      matcher: {}, contextMatcher: {},
      candidates: [{
        proposalId: 'proposal-2', text: 'Pfründe',
        start: question.indexOf('Pfründe'), end: question.indexOf('Pfründe') + 'Pfründe'.length,
        lemma: 'Pfründe', rule: 'noun_chunk', tokens: [], matchStatus: 'none', matches: [],
        suggestedTerm: {id: null, content: 'Pfründe', definition: null, conceptIri: null, isNew: true},
      }],
    }) as any)
    vi.mocked(TermDataService.reviewAnnotationProposals).mockResolvedValue(ok(undefined) as any)
    const wrapper = mountEditor()
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Propose')!.trigger('click')
    await flushPromises()
    await wrapper.findAll('button').find((button) => button.text() === 'Discard')!.trigger('click')
    await flushPromises()

    expect(TermDataService.reviewAnnotationProposals).toHaveBeenCalledWith('p-1', 'q-1', 'run-2', true)
    expect(TermDataService.saveAnnotationVersion).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
