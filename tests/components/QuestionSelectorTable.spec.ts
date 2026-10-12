import {describe, expect, it} from 'vitest'
import {nextTick} from 'vue'
import QuestionSelectorTable from '../../src/components/QuestionSelectorTable.vue'
import {lastEmitted, mountWithApp} from '../helpers/mount'
import {visibleQuestions} from '../helpers/table'
import {makeCq, makeGroup} from '../fixtures/factories'
import {useStore} from '../../src/store'

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
      // The source copy on top, then the list with the source again.
      const boxes = wrapper.findAll<HTMLInputElement>('tbody input[type="checkbox"]')
      expect(boxes.map(b => b.element.checked)).toEqual([true, true, false])

      await boxes[2].setValue(true)
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
      expect(visibleQuestions(wrapper)).toEqual(['Question in B?', 'Question in A?', 'Question in B?'])
      expect(boxes.map(b => b.element.checked)).toEqual([true, false, true])
    })
  })

  describe('read-only', () => {
    it('hides checkboxes and the selection count when not selectable', () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [cqA, cqB], initialSelectedIds: ['cq-a'], selectable: false },
      })

      expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)
      expect(wrapper.text()).not.toContain('selected')
      expect(wrapper.find('[data-test="sources-separator"]').exists()).toBe(false)
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

    it('starts with the filters, search and catalogues of the CQ dashboard', () => {
      const catalogueA = { id: 't-a', identifier: 'A', name: 'Persons' }
      const catalogueB = { id: 't-b', identifier: 'B', name: 'Places' }
      const store = useStore()
      store.cqFilters.discussion = 'with'
      store.cqSearchQuery = 'bishop'
      store.cqSelectedTopicIds = ['t-a']
      const cqs = [
        makeCq({ question: 'Which bishop?', noComments: 1, topic: catalogueA }),
        makeCq({ question: 'Which bishop, uncommented?', topic: catalogueA }),
        makeCq({ question: 'Which pope?', noComments: 1, topic: catalogueA }),
        makeCq({ question: 'Which bishop elsewhere?', noComments: 1, topic: catalogueB }),
      ]
      const { wrapper } = mountWithApp(QuestionSelectorTable, { props: { cqs } })

      expect(visibleQuestions(wrapper)).toEqual(['Which bishop?'])
    })

    it('does not change the CQ dashboard filters', async () => {
      const store = useStore()
      store.cqSearchQuery = 'bishop'
      const { wrapper } = mountWithApp(QuestionSelectorTable, { props: { cqs: [cqA, cqB] } })

      ;(wrapper.vm as any).filters.discussion = 'with'
      ;(wrapper.vm as any).filters.type.push('SCQ')
      ;(wrapper.vm as any).filterText = 'pope'
      ;(wrapper.vm as any).selectedTopicIds.push('t-a')
      await nextTick()

      expect(store.cqFilters.discussion).toBe('any')
      expect(store.cqFilters.type).toEqual([])
      expect(store.cqSearchQuery).toBe('bishop')
      expect(store.cqSelectedTopicIds).toEqual([])
    })

    it('shows copies of the sources above the list, even when the filters would hide them', async () => {
      const source = makeCq({ id: 'src', question: 'Source?', cqCatalogueIdentifier: 'B.1' })
      const commented = makeCq({ id: 'com', question: 'Commented?', noComments: 2, cqCatalogueIdentifier: 'A.1' })
      const silent = makeCq({ id: 'sil', question: 'Silent?', cqCatalogueIdentifier: 'A.2' })
      const { wrapper } = mountWithApp(QuestionSelectorTable, {
        props: { cqs: [silent, commented, source], initialSelectedIds: ['src'] },
      })
      // The copy on top, the separator, then the source again at its sorted place.
      expect(visibleQuestions(wrapper)).toEqual(['Source?', 'Commented?', 'Silent?', 'Source?'])
      const rows = wrapper.findAll('tbody tr')
      expect(rows[1].attributes('data-test')).toBe('sources-separator')

      ;(wrapper.vm as any).filters.discussion = 'with'
      await nextTick()
      expect(visibleQuestions(wrapper)).toEqual(['Source?', 'Commented?'])

      // An unchecked source stays pinned so it can be checked again.
      await wrapper.findAll<HTMLInputElement>('tbody input[type="checkbox"]')[0].setValue(false)
      expect(visibleQuestions(wrapper)).toEqual(['Source?', 'Commented?'])
    })
  })

  describe('sorting', () => {
    const cqs = [
      makeCq({ id: 'c', question: 'Charlie?', cqCatalogueIdentifier: 'B.1' }),
      makeCq({ id: 'a', question: 'Alpha?', cqCatalogueIdentifier: '#.1' }),
      makeCq({ id: 'b', question: 'Bravo?', cqCatalogueIdentifier: 'A.1' }),
    ]

    it('sorts by catalogue ID by default', () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, { props: { cqs } })
      expect(visibleQuestions(wrapper)).toEqual(['Bravo?', 'Charlie?', 'Alpha?'])
    })

    it('sorts by a column when its header is clicked and reverses on a second click', async () => {
      const { wrapper } = mountWithApp(QuestionSelectorTable, { props: { cqs } })

      await wrapper.find('[data-test="sort-question"]').trigger('click')
      expect(visibleQuestions(wrapper)).toEqual(['Alpha?', 'Bravo?', 'Charlie?'])

      await wrapper.find('[data-test="sort-question"]').trigger('click')
      expect(visibleQuestions(wrapper)).toEqual(['Charlie?', 'Bravo?', 'Alpha?'])
    })
  })
})
