import {describe, expect, it} from 'vitest'
import {nextTick} from 'vue'
import QuestionSelectorTable from '../../src/components/QuestionSelectorTable.vue'
import {lastEmitted, mountWithApp} from '../helpers/mount'
import {visibleQuestions} from '../helpers/table'
import {makeCq, makeGroup} from '../fixtures/factories'

const groupA = makeGroup({ id: 'g-a', name: 'Group A' })
const groupB = makeGroup({ id: 'g-b', name: 'Group B' })
const groupOptions = [{ id: '', name: 'All groups' }, groupA, groupB]
const cqA = makeCq({ id: 'cq-a', group: groupA, question: 'Question in A?' })
const cqB = makeCq({ id: 'cq-b', group: groupB, question: 'Question in B?' })

describe('QuestionSelectorTable', () => {
  describe('group preselection', () => {
    it('preselects initialGroup when groups are available on mount', () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], groups: groupOptions, initialGroup: { ...groupB } },
      })

      expect(visibleQuestions(wrapper)).toEqual(['Question in B?'])
      expect(wrapper.text()).toContain('Group B')
    })

    it('keeps initialGroup when groups arrive after mount', async () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], groups: [], initialGroup: { ...groupB } },
      })
      await wrapper.setProps({ groups: groupOptions })

      expect(visibleQuestions(wrapper)).toEqual(['Question in B?'])
      expect(lastEmitted(wrapper, 'groupChanged')).toEqual([groupB])
    })

    it('falls back to "All groups" when initialGroup does not exist', async () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], groups: [], initialGroup: { id: 'gone', name: 'Deleted' } },
      })
      await wrapper.setProps({ groups: groupOptions })

      expect(visibleQuestions(wrapper)).toEqual(['Question in A?', 'Question in B?'])
    })
  })

  describe('selection', () => {
    it('checks initialSelectedIds and emits the full selection on change', async () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], initialSelectedIds: ['cq-a'] },
      })
      const boxes = wrapper.findAll<HTMLInputElement>('tbody input[type="checkbox"]')
      expect(boxes.map(b => b.element.checked)).toEqual([true, false])

      await boxes[1].setValue(true)
      expect(lastEmitted(wrapper, 'selectionChanged')).toEqual([['cq-a', 'cq-b']])

      await boxes[0].setValue(false)
      expect(lastEmitted(wrapper, 'selectionChanged')).toEqual([['cq-b']])
    })

    it('follows initialSelectedIds when they change after mount', async () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], initialSelectedIds: [] },
      })
      await wrapper.setProps({ initialSelectedIds: ['cq-b'] })

      const boxes = wrapper.findAll<HTMLInputElement>('tbody input[type="checkbox"]')
      expect(boxes.map(b => b.element.checked)).toEqual([false, true])
    })
  })

  describe('read-only', () => {
    it('hides checkboxes and the selection count when not selectable', () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], initialSelectedIds: ['cq-a'], selectable: false },
      })

      expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
      expect(wrapper.text()).not.toContain('selected')
      expect(visibleQuestions(wrapper)).toEqual(['Question in A?', 'Question in B?'])
    })
  })

  describe('filters', () => {
    it('hides questions that do not match the attribute filters', async () => {
      const commented = makeCq({ question: 'Commented?', noComments: 2 })
      const silent = makeCq({ question: 'Silent?' })
      const { wrapper } = mountWithApp(QuestionSelectorTable, { props: { cqs: [commented, silent] } })

      ;(wrapper.vm as any).filters.discussion = 'with'
      await nextTick()

      expect(visibleQuestions(wrapper)).toEqual(['Commented?'])
    })
  })
})
