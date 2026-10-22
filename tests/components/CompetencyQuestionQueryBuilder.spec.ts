import {describe, expect, it} from 'vitest'
import CompetencyQuestionQueryBuilder from '../../src/components/CompetencyQuestionQueryBuilder.vue'
import TermAnnotationSpanEditor from '../../src/components/TermAnnotationSpanEditor.vue'
import {lastEmitted, mountWithApp} from '../helpers/mount'

const question = 'Welche Pfründe erhielt der Petent?'
const editor = {id: 'u-1', email: 'u@example.org', name: 'User'}
const annotation = (content: string, id: string) => {
  const start = question.indexOf(content)
  return {id, content, start, end: start + content.length, term: {id: `t-${id}`, content, definition: null, conceptIri: null}}
}
const revisions: QuestionRevisionT[] = [{
  id: 'r-1', questionString: question, sparqlQuery: null, exampleAnswer: null, versionNumber: 1, editor,
  annotationVersions: [{
    id: 'av-1', versionNumber: 1, retainedFromAnnotationVersionId: null, editor,
    annotations: [annotation('Pfründe', 'a-1'), annotation('Petent', 'a-2')],
  }],
}]

const saveButton = (wrapper: ReturnType<typeof mountBuilder>) =>
  wrapper.findAll('button').find((button) => button.text() === 'Save')!

function mountBuilder() {
  return mountWithApp(CompetencyQuestionQueryBuilder, {
    props: {question, revisions, canEdit: true, id: 'q-1', projectId: 'p-1'},
    global: {stubs: {TermAnnotationSpanEditor: true, SparqlEditor: true, SubmitButtonWithCallback: true, CqTypeSelect: true}},
  }).wrapper
}

describe('CompetencyQuestionQueryBuilder', () => {
  it('moves annotations along with the edited question text and saves them', async () => {
    const wrapper = mountBuilder()
    await wrapper.get('textarea#question').setValue('Welche Pfründe erhielt der arme Bittsteller?')
    const preview = wrapper.getComponent(TermAnnotationSpanEditor).props('previewAnnotations')
    expect(preview.map(({content, start, end}: AnnotationInCQT) => [content, start, end])).toEqual([['Pfründe', 7, 14]])
    expect(wrapper.text()).toContain('1 annotation will be removed')

    await saveButton(wrapper).trigger('click')
    expect(lastEmitted(wrapper, 'saveCompetencyQuestion')?.[0]).toMatchObject({
      question: 'Welche Pfründe erhielt der arme Bittsteller?',
      annotations: [{passage: 'Pfründe', term: 'Pfründe', start: 7, end: 14, definition: null, conceptIri: null}],
    })
    wrapper.unmount()
  })

  it('restores dropped annotations when the saved text is restored and sends none without a text edit', async () => {
    const wrapper = mountBuilder()
    const textarea = wrapper.get('textarea#question')
    await textarea.setValue('Welche Ämter?')
    await textarea.setValue(question)
    expect(wrapper.getComponent(TermAnnotationSpanEditor).props('previewAnnotations')).toHaveLength(2)

    await saveButton(wrapper).trigger('click')
    expect(lastEmitted(wrapper, 'saveCompetencyQuestion')?.[0]).not.toHaveProperty('annotations')
    wrapper.unmount()
  })
})

describe('TermAnnotationSpanEditor preview', () => {
  it('labels the unsaved text with the moved annotations instead of the saved revision', () => {
    const edited = 'Welche kirchlichen Pfründe?'
    const moved = {...annotation('Pfründe', 'a-1'), start: 19, end: 26}
    const wrapper = mountWithApp(TermAnnotationSpanEditor, {
      props: {
        text: edited, revisions, selectedRevisionId: 'r-1', selectedAnnotationVersionId: 'av-1',
        canEdit: false, questionTextChanged: true, questionId: 'q-1', projectId: 'p-1', previewAnnotations: [moved],
      },
    }).wrapper
    expect(wrapper.text()).toContain('kirchlichen')
    expect(wrapper.find('.annotation-source[style]').text()).toBe('Pfründe')
    expect(wrapper.findAll('.annotation-bar')).toHaveLength(1)
    expect(wrapper.find('.annotation-label').exists()).toBe(true)
    wrapper.unmount()
  })
})
