import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {DEFAULT_CQ_FILTERS, countActiveFilters, normalizeCqFilters, tagFilterOptions, tagsOf, useCqFilters, type CqFilters} from '../../src/utils/cqFilters'
import {toRef} from 'vue'
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

  it('counts only filters that are not "any" or empty', () => {
    expect(countActiveFilters({ ...DEFAULT_CQ_FILTERS, rating: '3', type: ['none', 'SCQ'] })).toBe(2)
  })

  it.each([
    [['me'], ['mine']],
    [['alice'], ['hers']],
    [['me', 'alice'], ['mine', 'hers']],
  ])('filters by authors %j', (author, expected) => {
    const cqs = [makeCq({ id: 'mine', author: me }), makeCq({ id: 'hers', author: alice }), makeCq({ id: 'zoe', author: makeUser({ id: 'zoe' }) })]
    expect(filterWith(cqs, { author })).toEqual(expected)
  })

  it('filters by several types, including "no type"', () => {
    const cqs = [makeCq({ id: 'scq', type: 'SCQ' }), makeCq({ id: 'vcq', type: 'VCQ' }), makeCq({ id: 'untyped', type: null })]
    expect(filterWith(cqs, { type: ['SCQ', 'none'] })).toEqual(['scq', 'untyped'])
  })

  it('converts single filter values persisted by older versions to lists', () => {
    const legacy = { ...DEFAULT_CQ_FILTERS, author: 'me', type: 'any', tag: 't-1' } as unknown as CqFilters
    expect(normalizeCqFilters(legacy)).toMatchObject({ author: ['me'], type: [], tag: ['t-1'] })
    expect(normalizeCqFilters(null)).toEqual(DEFAULT_CQ_FILTERS)
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

  describe('date filters', () => {
    const now = new Date('2026-10-06T12:00:00Z')
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
    const cqs = [
      makeCq({ id: 'today', createdAt: daysAgo(0.5), updatedAt: daysAgo(0.5), lastCommentAt: daysAgo(0.5) }),
      makeCq({ id: 'week', createdAt: daysAgo(5), updatedAt: daysAgo(5), lastCommentAt: daysAgo(5) }),
      makeCq({ id: 'old', createdAt: daysAgo(60), updatedAt: daysAgo(60), lastCommentAt: daysAgo(60) }),
      makeCq({ id: 'silent', createdAt: daysAgo(60), updatedAt: daysAgo(2), lastCommentAt: null }),
    ]

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(now)
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([
      ['within_1d', ['today']],
      ['within_7d', ['today', 'week']],
      ['older_30d', ['old', 'silent']],
    ])('filters by created %s', (created, expected) => {
      expect(filterWith(cqs, { created })).toEqual(expected)
    })

    it('filters by last change independently of creation', () => {
      expect(filterWith(cqs, { updated: 'within_7d' })).toEqual(['today', 'week', 'silent'])
    })

    it('filters by last comment, excluding uncommented CQs from date ranges', () => {
      expect(filterWith(cqs, { lastComment: 'none' })).toEqual(['silent'])
      expect(filterWith(cqs, { lastComment: 'within_30d' })).toEqual(['today', 'week'])
      expect(filterWith(cqs, { lastComment: 'older_30d' })).toEqual(['old'])
    })
  })

  describe('tag filter', () => {
    const urgent = { id: 't-urgent', name: 'urgent' }
    const archive = { id: 't-archive', name: 'Archive' }
    const cqs = [
      makeCq({ id: 'both', tags: [archive, urgent] }),
      makeCq({ id: 'urgent', tags: [urgent] }),
      makeCq({ id: 'untagged', tags: [] }),
      makeCq({ id: 'legacy' }),
    ]

    it('keeps CQs carrying any of the selected tags', () => {
      expect(filterWith(cqs, { tag: [urgent.id] })).toEqual(['both', 'urgent'])
      expect(filterWith(cqs, { tag: [archive.id] })).toEqual(['both'])
      expect(filterWith(cqs, { tag: [archive.id, 'none'] })).toEqual(['both', 'untagged', 'legacy'])
    })

    it('treats CQs without a tags field as untagged', () => {
      expect(filterWith(cqs, { tag: ['none'] })).toEqual(['untagged', 'legacy'])
    })

    it('collects the distinct tags of a CQ list, sorted by name', () => {
      expect(tagsOf(cqs)).toEqual([archive, urgent])
    })

    it('offers "none" before the tags', () => {
      expect(tagFilterOptions([archive]).map(o => o.value)).toEqual(['none', archive.id])
    })
  })

  it('lists "Me" plus the other authors, sorted by name', () => {
    const cqs = [makeCq({ author: makeUser({ id: 'z', name: 'Zoe' }) }), makeCq({ author: alice }), makeCq({ author: me })]
    const labels = useCqFilters(() => cqs).authorOptions.value.map(o => o.label)
    expect(labels).toEqual(['Me', 'Alice', 'Zoe'])
  })

  it('reads and writes the filter state through a provided ref', () => {
    const store = useStore()
    const cqs = [makeCq({ id: 'mine', author: me }), makeCq({ id: 'theirs', author: alice })]
    const f = useCqFilters(() => cqs, toRef(store, 'cqFilters'))

    store.cqFilters.author = ['me']
    expect(cqs.filter(f.matchesFilters).map(cq => cq.id)).toEqual(['mine'])

    f.filters.value = normalizeCqFilters(null)
    expect(store.cqFilters.author).toEqual([])
  })
})
