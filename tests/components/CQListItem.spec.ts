import {describe, expect, it} from 'vitest'
import CQListItem from '../../src/components/CQListItem.vue'
import {mountWithApp} from '../helpers/mount'
import {makeCq} from '../fixtures/factories'

const cq = makeCq({
  id: '2de6c0c8-3565-4c5a-bc85-3b5971e0e452',
  question: 'Which kebab shops exist in Jena?',
  noComments: 3,
  noUnreadComments: 2,
  lastComment: { comment: 'Needs a better example answer.', author: 'Alice', createdAt: '2026-10-01T12:00:00Z' },
})

describe('CQListItem', () => {
  it('shows the unread last comment with its author but not the UUID', () => {
    const { wrapper } = mountWithApp(CQListItem, { props: { cq, showLastComment: true } })

    expect(wrapper.text()).toContain('Needs a better example answer.')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain(cq.id)
  })

  it('hides the last comment when switched off but keeps the comment count', () => {
    const { wrapper } = mountWithApp(CQListItem, { props: { cq, showLastComment: false } })

    expect(wrapper.text()).not.toContain('Needs a better example answer.')
    expect(wrapper.find('.bg-red-500').text()).toBe('2')
  })

  it('shows a red badge with the unread count', () => {
    const { wrapper } = mountWithApp(CQListItem, { props: { cq } })

    const badge = wrapper.find('[title="2 unread of 3 comments"]')
    expect(badge.text()).toBe('2')
    expect(badge.classes()).toContain('bg-red-500')
  })

  it('shows a grey badge with the total once all comments are read', () => {
    const readCq = { ...cq, noUnreadComments: 0, lastComment: null }
    const { wrapper } = mountWithApp(CQListItem, { props: { cq: readCq, showLastComment: true } })

    const badge = wrapper.find('[title="3 comments, all read"]')
    expect(badge.text()).toBe('3')
    expect(badge.classes()).not.toContain('bg-red-500')
    expect(wrapper.find('.bg-red-500').exists()).toBe(false)
  })

  it('shows no comment badge without comments', () => {
    const { wrapper } = mountWithApp(CQListItem, { props: { cq: { ...cq, noComments: 0, noUnreadComments: 0, lastComment: null } } })

    expect(wrapper.find('.rounded-full').exists()).toBe(false)
  })
})
