import {beforeEach, describe, expect, it, vi} from 'vitest'
import {flushPromises} from '@vue/test-utils'
import ConsolidationCreateView from '../../src/views/ConsolidationCreateView.vue'
import GroupDataService from '../../src/services/GroupDataService'
import CompetencyQuestionDataService from '../../src/services/CompetencyQuestionDataService'
import ConsolidationDataService from '../../src/services/ConsolidationDataService'
import {useStore} from '../../src/store'
import {mountWithApp} from '../helpers/mount'
import {visibleQuestions} from '../helpers/table'
import {apiError, ok} from '../helpers/api'
import {makeCq, makeGroup, makeProject} from '../fixtures/factories'

vi.mock('../../src/services/GroupDataService', () => ({ default: { getAllForOneProject: vi.fn() } }))
vi.mock('../../src/services/CompetencyQuestionDataService', () => ({ default: { getAllForOneProject: vi.fn() } }))
vi.mock('../../src/services/ConsolidationDataService', () => ({ default: { add: vi.fn() } }))

const project = makeProject({ id: 'p-1' })
const groupA = makeGroup({ id: 'g-a', name: 'Group A' })
const groupB = makeGroup({ id: 'g-b', name: 'Group B' })
const cqA = makeCq({ id: 'cq-a', group: groupA, question: 'Question in A?' })
const cqB = makeCq({ id: 'cq-b', group: groupB, question: 'Question in B?' })

describe('ConsolidationCreateView', () => {
  beforeEach(() => {
    const store = useStore()
    store.project = project
    vi.mocked(GroupDataService.getAllForOneProject).mockResolvedValue(ok([groupA, groupB]) as any)
    vi.mocked(CompetencyQuestionDataService.getAllForOneProject).mockResolvedValue(ok([cqA, cqB]) as any)
  })

  describe('group preselection', () => {
    it('preselects the group chosen on the CQ dashboard in the source table', async () => {
      useStore().cqSelectedGroup = { id: groupB.id, name: groupB.name }

      const { wrapper } = mountWithApp(ConsolidationCreateView)
      await flushPromises()

      expect(visibleQuestions(wrapper)).toEqual(['Question in B?'])
    })

    it('preselects the dashboard group as the target group of a new result question', async () => {
      useStore().cqSelectedGroup = { id: groupB.id, name: groupB.name }

      const { wrapper } = mountWithApp(ConsolidationCreateView)
      await flushPromises()

      expect((wrapper.vm as any).resultGroup.id).toBe(groupB.id)
    })

    it('shows all groups when no group is selected on the dashboard', async () => {
      const { wrapper } = mountWithApp(ConsolidationCreateView)
      await flushPromises()

      expect(visibleQuestions(wrapper)).toEqual(['Question in A?', 'Question in B?'])
    })
  })

  describe('saving', () => {
    async function createWithNewQuestion() {
      useStore().cqSelectedGroup = { id: groupA.id, name: groupA.name }
      const mounted = mountWithApp(ConsolidationCreateView)
      await flushPromises()
      await mounted.wrapper.find('input[placeholder^="Enter the consolidated question"]').setValue('Merged?')
      await mounted.wrapper.findAll('button').find(b => b.text().includes('Create Consolidation'))!.trigger('click')
      await flushPromises()
      return mounted
    }

    it('returns to the CQ dashboard after creating', async () => {
      vi.mocked(ConsolidationDataService.add).mockResolvedValue(ok({ id: 'c-new' }) as any)

      const { router } = await createWithNewQuestion()

      expect(ConsolidationDataService.add).toHaveBeenCalledWith(
        project.id, expect.objectContaining({ question: 'Merged?', groupId: groupA.id }), [])
      expect(router.push).toHaveBeenCalledWith('/questions')
    })

    it('stays on the page when creating fails', async () => {
      vi.mocked(ConsolidationDataService.add).mockResolvedValue(apiError())

      const { router } = await createWithNewQuestion()

      expect(router.push).not.toHaveBeenCalled()
    })
  })
})
