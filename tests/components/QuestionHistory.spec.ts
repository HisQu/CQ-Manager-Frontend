import {describe, expect, it, vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import QuestionHistory from '../../src/components/QuestionHistory.vue'
import CompetencyQuestionDataService from '../../src/services/CompetencyQuestionDataService'
import {mountWithApp} from '../helpers/mount'
import {apiError, ok} from '../helpers/api'
import {setLocale} from '../../src/i18n'

vi.mock('../../src/services/CompetencyQuestionDataService', () => ({default: {getHistory: vi.fn()}}))

describe('QuestionHistory', () => {
  it('shows No entries when the loaded change log is empty and translates it to German', async () => {
    vi.mocked(CompetencyQuestionDataService.getHistory).mockResolvedValue(ok([]))
    const {wrapper} = mountWithApp(QuestionHistory, {props: {questionId: 'q-1'}})
    await flushPromises()
    expect(wrapper.text()).toBe('No entries')
    setLocale('de')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toBe('Keine Einträge')
    wrapper.unmount()
  })

  it('shows entries instead of the empty state when the change log has events', async () => {
    vi.mocked(CompetencyQuestionDataService.getHistory).mockResolvedValue(ok([{
      id: 'event-1', eventType: 'created', createdAt: '2026-10-01T12:00:00Z',
      versionNumber: 1, actor: {name: 'Alice'},
    }]) as any)
    const {wrapper} = mountWithApp(QuestionHistory, {props: {questionId: 'q-1'}})
    await flushPromises()
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('No entries')
    wrapper.unmount()
  })

  it('reports failed requests instead of presenting them as an empty change log', async () => {
    vi.mocked(CompetencyQuestionDataService.getHistory).mockResolvedValue(apiError())
    const {wrapper} = mountWithApp(QuestionHistory, {props: {questionId: 'q-1'}})
    await flushPromises()
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('No entries')
    wrapper.unmount()
  })
})
