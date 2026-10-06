import {computed, ref} from "vue";
import {useStore} from "../store.ts";
import {CQ_TYPES} from "../constants/cqTypes.ts";

// Attribute filters for CQ lists; 'any' always means "no filter".
export const DEFAULT_CQ_FILTERS = {
  author: 'any',        // 'any' | 'me' | <user id>
  discussion: 'any',    // 'any' | 'with' | 'without'
  rating: 'any',        // 'any' | 'unrated' | 'rated' | '1'..'5' (at least n stars)
  type: 'any',          // 'any' | 'none' | CQType
  sparql: 'any',        // 'any' | 'with' | 'without'
  exampleAnswer: 'any', // 'any' | 'with' | 'without'
  consolidation: 'any', // 'any' | 'consolidated' | 'not_consolidated'
};

export type CqFilters = typeof DEFAULT_CQ_FILTERS;

const withWithout = (what: string) => [
  { value: 'any', label: 'Any' },
  { value: 'with', label: `With ${what}` },
  { value: 'without', label: `Without ${what}` },
];

export const CQ_FILTER_OPTIONS = {
  discussion: withWithout('comments'),
  rating: [
    { value: 'any', label: 'Any rating' },
    { value: 'unrated', label: 'Unrated' },
    { value: 'rated', label: 'Rated' },
    ...[2, 3, 4].map(n => ({ value: String(n), label: `At least ${n} stars` })),
    { value: '5', label: '5 stars' },
  ],
  type: [
    { value: 'any', label: 'Any type' },
    { value: 'none', label: 'No type' },
    ...CQ_TYPES.map(t => ({ value: t, label: t })),
  ],
  sparql: withWithout('SPARQL query'),
  exampleAnswer: withWithout('example answer'),
  consolidation: [
    { value: 'any', label: 'Any' },
    { value: 'consolidated', label: 'Consolidated' },
    { value: 'not_consolidated', label: 'Not consolidated' },
  ],
};

export function countActiveFilters(filters: CqFilters): number {
  return Object.values(filters).filter(v => v !== 'any').length;
}

function isConsolidated(cq: CompetencyQuestionReducedT): boolean {
  return cq.unifiedEntryKind === 'consolidation_result'
    || (cq.consolidations?.length ?? 0) > 0
    || (cq.noConsolidations ?? 0) > 0;
}

function matchesWithWithout(filter: string, present: boolean): boolean {
  return filter === 'any' || (filter === 'with') === present;
}

/** Filter state plus the derived author options and predicate for a list of CQs. */
export function useCqFilters(getCqs: () => CompetencyQuestionReducedT[] | undefined) {
  const store = useStore();
  const filters = ref<CqFilters>({ ...DEFAULT_CQ_FILTERS });
  const activeFilterCount = computed(() => countActiveFilters(filters.value));

  const authorOptions = computed(() => {
    const byId = new Map<string, string>();
    for (const cq of getCqs() ?? []) {
      if (cq.author?.id) byId.set(cq.author.id, cq.author.name || cq.author.email);
    }
    const others = [...byId.entries()]
      .filter(([id]) => id !== store.getUser.id)
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
    return [
      { value: 'any', label: 'All authors' },
      { value: 'me', label: 'Me' },
      ...others,
    ];
  });

  function matchesFilters(cq: CompetencyQuestionReducedT): boolean {
    const f = filters.value;

    if (f.author !== 'any') {
      const authorId = f.author === 'me' ? store.getUser.id : f.author;
      if (cq.author?.id !== authorId) return false;
    }

    if (!matchesWithWithout(f.discussion, (cq.noComments ?? 0) > 0)) return false;

    const rating = cq.rating ?? 0;
    if (f.rating === 'unrated' && rating > 0) return false;
    if (f.rating === 'rated' && rating === 0) return false;
    if (/^\d$/.test(f.rating) && rating < Number(f.rating)) return false;

    if (f.type === 'none' && cq.type) return false;
    if (f.type !== 'any' && f.type !== 'none' && cq.type !== f.type) return false;

    if (!matchesWithWithout(f.sparql, !!cq.sparqlQuery?.trim())) return false;
    if (!matchesWithWithout(f.exampleAnswer, !!cq.exampleAnswer?.trim())) return false;

    if (f.consolidation === 'consolidated' && !isConsolidated(cq)) return false;
    if (f.consolidation === 'not_consolidated' && isConsolidated(cq)) return false;

    return true;
  }

  return { filters, activeFilterCount, authorOptions, matchesFilters };
}
