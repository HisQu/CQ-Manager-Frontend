import {describe, expect, it, vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import CommentComponent from '../../src/components/CommentComponent.vue'
import MessagePopup from '../../src/components/MessagePopup.vue'
import CommentDataService from '../../src/services/CommentDataService'
import {mountWithApp} from '../helpers/mount'
import {apiError, ok} from '../helpers/api'

vi.mock('../../src/services/CommentDataService', () => ({default: {comment: vi.fn()}}))

function mountComments(readonly = false) {
  return mountWithApp(CommentComponent, {
    props: {questionId: 'q-1', comments: [], pane: true, readonly},
    global: {stubs: {MessagePopup: true}},
  }).wrapper
}

describe('CommentComponent', () => {
  it('submits a comment, clears the submitted draft and refreshes the pane', async () => {
    vi.mocked(CommentDataService.comment).mockResolvedValue(ok({}) as any)
    const wrapper = mountComments()
    await wrapper.get('textarea').setValue('Review this question')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(CommentDataService.comment).toHaveBeenCalledWith('Review this question', 'q-1')
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
    wrapper.unmount()
  })

  it('preserves the draft and shows an error when submission fails', async () => {
    vi.mocked(CommentDataService.comment).mockResolvedValue(apiError('Please try again'))
    const wrapper = mountComments()
    await wrapper.get('textarea').setValue('Keep this comment')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('Keep this comment')
    expect(wrapper.getComponent(MessagePopup).props('open')).toBe(true)
    expect(wrapper.emitted('refresh')).toBeUndefined()
    wrapper.unmount()
  })

  it('prevents duplicate submission and retains edits made while a comment is sending', async () => {
    let resolve!: (response: any) => void
    vi.mocked(CommentDataService.comment).mockReturnValue(new Promise(r => { resolve = r }))
    const wrapper = mountComments()
    await wrapper.get('textarea').setValue('First comment')
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    await wrapper.get('button').trigger('click')
    await wrapper.get('textarea').setValue('Next comment')
    resolve(ok({}))
    await flushPromises()
    expect(CommentDataService.comment).toHaveBeenCalledTimes(1)
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('Next comment')
    wrapper.unmount()
  })

  it('shows comments without a composer for deleted questions', () => {
    const wrapper = mountComments(true)
    expect(wrapper.text()).toContain('No comments yet.')
    expect(wrapper.find('textarea').exists()).toBe(false)
    wrapper.unmount()
  })
})
