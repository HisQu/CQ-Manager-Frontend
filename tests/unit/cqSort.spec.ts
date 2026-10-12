import {describe, expect, it} from 'vitest'
import {sortCqs, toggleCqSort, DEFAULT_CQ_SORT} from '../../src/utils/cqSort'
import {makeCq, makeUser} from '../fixtures/factories'

const ids = (cqs: CompetencyQuestionReducedT[]) => cqs.map(cq => cq.id)

describe('cqSort', () => {
  it('orders by catalogue, then numerically by index, with uncatalogued last', () => {
    const cqs = [
      makeCq({ id: 'hash-1', cqCatalogueIdentifier: '#.1' }),
      makeCq({ id: 'b-1', cqCatalogueIdentifier: 'B.1' }),
      makeCq({ id: 'a-10', cqCatalogueIdentifier: 'A.10' }),
      makeCq({ id: 'aa-1', cqCatalogueIdentifier: 'AA.1' }),
      makeCq({ id: 'a-2', cqCatalogueIdentifier: 'A.2' }),
    ]

    expect(ids(sortCqs(cqs, DEFAULT_CQ_SORT))).toEqual(['a-2', 'a-10', 'b-1', 'aa-1', 'hash-1'])
    expect(ids(sortCqs(cqs, { field: 'catalogue', direction: 'desc' }))).toEqual(['hash-1', 'aa-1', 'b-1', 'a-10', 'a-2'])
  })

  it('sorts dates and keeps CQs without a value last in both directions', () => {
    const cqs = [
      makeCq({ id: 'old', lastCommentAt: '2026-01-01T00:00:00Z', cqCatalogueIdentifier: '#.1' }),
      makeCq({ id: 'never', lastCommentAt: null, cqCatalogueIdentifier: '#.2' }),
      makeCq({ id: 'new', lastCommentAt: '2026-06-01T00:00:00Z', cqCatalogueIdentifier: '#.3' }),
    ]

    expect(ids(sortCqs(cqs, { field: 'lastComment', direction: 'desc' }))).toEqual(['new', 'old', 'never'])
    expect(ids(sortCqs(cqs, { field: 'lastComment', direction: 'asc' }))).toEqual(['old', 'new', 'never'])
  })

  it('sorts text case-insensitively and breaks ties by catalogue ID', () => {
    const cqs = [
      makeCq({ id: 'bob-2', author: makeUser({ name: 'bob' }), cqCatalogueIdentifier: 'A.2' }),
      makeCq({ id: 'alice', author: makeUser({ name: 'Alice' }), cqCatalogueIdentifier: 'A.3' }),
      makeCq({ id: 'bob-1', author: makeUser({ name: 'Bob' }), cqCatalogueIdentifier: 'A.1' }),
    ]

    expect(ids(sortCqs(cqs, { field: 'author', direction: 'asc' }))).toEqual(['alice', 'bob-1', 'bob-2'])
  })

  it('does not change the input array', () => {
    const cqs = [makeCq({ id: 'x', rating: 1 }), makeCq({ id: 'y', rating: 5 })]
    sortCqs(cqs, { field: 'rating', direction: 'desc' })
    expect(ids(cqs)).toEqual(['x', 'y'])
  })

  it('flips the direction for the active field and uses the default for a new one', () => {
    expect(toggleCqSort(DEFAULT_CQ_SORT, 'catalogue')).toEqual({ field: 'catalogue', direction: 'desc' })
    expect(toggleCqSort(DEFAULT_CQ_SORT, 'created')).toEqual({ field: 'created', direction: 'desc' })
    expect(toggleCqSort(DEFAULT_CQ_SORT, 'question')).toEqual({ field: 'question', direction: 'asc' })
  })
})
