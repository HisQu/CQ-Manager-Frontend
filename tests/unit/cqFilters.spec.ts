import {beforeEach, describe, expect, it} from 'vitest'
import {DEFAULT_CQ_FILTERS, countActiveFilters, useCqFilters, type CqFilters} from '../../src/utils/cqFilters'
import {useStore} from '../../src/store'
import {makeCq, makeUser} from '../fixtures/factories'

const me = makeUser({ id: 'me', name: 'Me Myself' })
const alice = makeUser({ id: 'alice', name: 'Alice' })

function filterWith(cqs: CompetencyQuestionReducedT[], filters: Partial<CqFilters>) {
  const f = useCqFilters(() => cqs)
  f.filters.value = { ...DEFAULT_CQ_FILTERS, ...filters }
  return cqs.filter(f.matchesFilters).map(cq => cq.id)
}

describe('cqFilters', () => {
  beforeEach(() => {
    useStore().user.id = me.id
  })

  it('matches everything with the default filters', () => {
    const cqs = [makeCq({ id: 'a' }), makeCq({ id: 'b' })]
    expect(filterWith(cqs, {})).toEqual(['a', 'b'])
  })

  it('counts only filters that are not "any"', () => {
    expect(countActiveFilters({ ...DEFAULT_CQ_FILTERS, rating: '3', type: 'none' })).toBe(2)
  })

  it.each([
    ['me', ['mine']],
    ['alice', ['hers']],
  ])('filters by author %s', (author, expected) => {
    const cqs = [makeCq({ id: 'mine', author: me }), makeCq({ id: 'hers', author: alice })]
    expect(filterWith(cqs, { author })).toEqual(expected)
  })

  it.each([
    ['unrated', ['r0']],
    ['rated', ['r2', 'r4']],
    ['3', ['r4']],
  ])('filters by rating %s', (rating, expected) => {
    const cqs = [makeCq({ id: 'r0', rating: 0 }), makeCq({ id: 'r2', rating: 2 }), makeCq({ id: 'r4', rating: 4 })]
    expect(filterWith(cqs, { rating })).toEqual(expected)
  })

  it('treats whitespace-only SPARQL queries as missing', () => {
    const cqs = [makeCq({ id: 'blank', sparqlQuery: '  ' }), makeCq({ id: 'query', sparqlQuery: 'SELECT * {}' })]
    expect(filterWith(cqs, { sparql: 'with' })).toEqual(['query'])
    expect(filterWith(cqs, { sparql: 'without' })).toEqual(['blank'])
  })

  it('counts consolidation results and consolidated questions as consolidated', () => {
    const cqs = [
      makeCq({ id: 'result', unifiedEntryKind: 'consolidation_result' }),
      makeCq({ id: 'source', noConsolidations: 1 }),
      makeCq({ id: 'plain' }),
    ]
    expect(filterWith(cqs, { consolidation: 'consolidated' })).toEqual(['result', 'source'])
    expect(filterWith(cqs, { consolidation: 'not_consolidated' })).toEqual(['plain'])
  })

  it('lists "Me" plus the other authors, sorted by name', () => {
    const cqs = [makeCq({ author: makeUser({ id: 'z', name: 'Zoe' }) }), makeCq({ author: alice }), makeCq({ author: me })]
    const labels = useCqFilters(() => cqs).authorOptions.value.map(o => o.label)
    expect(labels).toEqual(['All authors', 'Me', 'Alice', 'Zoe'])
  })
})
