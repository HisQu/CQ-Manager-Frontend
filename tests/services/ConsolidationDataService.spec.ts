import {describe, expect, it, vi} from 'vitest'
import http from '../../src/services/httpCommon'
import ConsolidationDataService from '../../src/services/ConsolidationDataService'
import {ok} from '../helpers/api'

vi.mock('../../src/services/httpCommon', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

// Request shapes are checked against the backend API schema (API.md).
describe('ConsolidationDataService', () => {
  it('adds source questions with PUT .../questions/add and { sourceQuestionIds }', async () => {
    vi.mocked(http.put).mockResolvedValue(ok({}))

    await ConsolidationDataService.addQuestions('c-1', 'p-1', ['q-1', 'q-2'])

    expect(http.put).toHaveBeenCalledWith(
      '/consolidations/p-1/c-1/questions/add',
      { sourceQuestionIds: ['q-1', 'q-2'] },
      expect.anything(),
    )
  })

  it('removes source questions with PUT .../questions/remove and { sourceQuestionIds }', async () => {
    vi.mocked(http.put).mockResolvedValue(ok({}))

    await ConsolidationDataService.removeQuestions('c-1', 'p-1', ['q-1'])

    expect(http.put).toHaveBeenCalledWith(
      '/consolidations/p-1/c-1/questions/remove',
      { sourceQuestionIds: ['q-1'] },
      expect.anything(),
    )
  })

  it('turns a failed request into an error UXResponse', async () => {
    vi.mocked(http.put).mockRejectedValue(new Error('500'))

    const response = await ConsolidationDataService.addQuestions('c-1', 'p-1', ['q-1'])

    expect(response).toMatchObject({ messageType: 'error' })
  })
})
