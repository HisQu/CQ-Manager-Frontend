import { t } from '../i18n'
import {computed, ref, type Ref} from "vue";
import {useStore} from "../store.ts";
import {CQ_TYPES} from "../constants/cqTypes.ts";
import {UNCATALOGUED_IDENTIFIER, catalogueName} from "./catalogues.ts";

// Attribute filters for CQ lists; 'any' (or an empty list for multi-selects) always means "no filter".
// Multi-select filters match a CQ that fits any of the chosen values.
export const DEFAULT_CQ_FILTERS = {
  author: [] as string[], // 'me' | <user id>
  discussion: 'any',    // 'any' | 'with' | 'without'
  rating: 'any',        // 'any' | 'unrated' | 'rated' | '1'..'5' (at least n stars)
  type: [] as string[], // 'none' | CQType
  tag: [] as string[],  // 'none' | <tag id>
  sparql: 'any',        // 'any' | 'with' | 'without'
  exampleAnswer: 'any', // 'any' | 'with' | 'without'
  consolidation: 'any', // 'any' | 'consolidated' | 'not_consolidated'
  created: 'any',       // 'any' | DateRange
  updated: 'any',       // 'any' | DateRange
  lastComment: 'any',   // 'any' | 'none' | DateRange
};

export type CqFilters = typeof DEFAULT_CQ_FILTERS;

const MULTI_SELECT_FILTERS = ['author', 'type', 'tag'] as const;

/** Fills in missing filters and converts single values persisted by older versions ('any' or one value) to lists. */
export function normalizeCqFilters(filters: Partial<Record<keyof CqFilters, unknown>> | null | undefined): CqFilters {
  const result = { ...DEFAULT_CQ_FILTERS, ...filters } as CqFilters;
  for (const key of MULTI_SELECT_FILTERS) {
    const value: unknown = result[key];
    result[key] = Array.isArray(value) ? [...value] : (typeof value === 'string' && value !== 'any' ? [value] : []);
  }
  return result;
}

const withWithout = (what: 'Comments' | 'Sparql' | 'ExampleAnswer') => [
  { value: 'any', get label() { return t('any') } },
  { value: 'with', get label() { return t(`with${what}`) } },
  { value: 'without', get label() { return t(`without${what}`) } },
];

const DAY_MS = 24 * 60 * 60 * 1000;

// DateRange values: 'within_<n>d' (at most n days ago) | 'older_<n>d' (more than n days ago).
const dateRanges = [
  { value: 'within_1d', get label() { return t('last24Hours') } },
  { value: 'within_7d', get label() { return t('last7Days') } },
  { value: 'within_30d', get label() { return t('last30Days') } },
  { value: 'older_30d', get label() { return t('moreThan30DaysAgo') } },
];

export const CQ_FILTER_OPTIONS = {
  discussion: withWithout('Comments'),
  rating: [
    { value: 'any', get label() { return t('anyRating') } },
    { value: 'unrated', get label() { return t('unrated') } },
    { value: 'rated', get label() { return t('rated') } },
    ...[2, 3, 4].map(n => ({ value: String(n), get label() { return t('atLeastStars', { count: n }) } })),
    { value: '5', get label() { return t('5Stars') } },
  ],
  type: [
    { value: 'none', get label() { return t('noType') } },
    ...CQ_TYPES.map(t => ({ value: t, label: t })),
  ],
  sparql: withWithout('Sparql'),
  exampleAnswer: withWithout('ExampleAnswer'),
  consolidation: [
    { value: 'any', get label() { return t('any') } },
    { value: 'consolidated', get label() { return t('consolidated') } },
    { value: 'not_consolidated', get label() { return t('notConsolidated') } },
  ],
  created: [{ value: 'any', get label() { return t('anyTime') } }, ...dateRanges],
  updated: [{ value: 'any', get label() { return t('anyTime') } }, ...dateRanges],
  lastComment: [
    { value: 'any', get label() { return t('anyTime') } },
    { value: 'none', get label() { return t('noComments') } },
    ...dateRanges,
  ],
};

/** The distinct tags carried by a list of CQs, sorted by name. */
export function tagsOf(cqs: CompetencyQuestionReducedT[]): TagReducedT[] {
  const byId = new Map<string, TagReducedT>();
  for (const cq of cqs) {
    for (const tag of cq.tags ?? []) byId.set(tag.id, tag);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function tagFilterOptions(tags: TagReducedT[]) {
  return [
    { value: 'none', get label() { return t('noTags') } },
    ...tags.map(t => ({ value: t.id, label: `#${t.name}` })),
  ];
}

/** Every word of the query has to appear in the question, comment, catalogue ID, author or a tag name. */
export function matchesCqSearch(cq: CompetencyQuestionReducedT, query: string): boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = [cq.question, cq.comment, cq.cqCatalogueIdentifier, cq.author?.name, ...(cq.tags ?? []).map(t => t.name)]
    .filter(Boolean).join(' ').toLowerCase();
  return words.every(word => text.includes(word));
}

/** The distinct catalogues of a list of CQs as filter options, in identifier order with the uncatalogued catch-all last. */
export function catalogueFilterOptions(cqs: CompetencyQuestionReducedT[]) {
  const byId = new Map<string, TopicReducedT>();
  for (const cq of cqs) {
    if (cq.topic) byId.set(cq.topic.id, cq.topic);
  }
  const rank = (t: TopicReducedT) => t.identifier === UNCATALOGUED_IDENTIFIER ? Number.MAX_SAFE_INTEGER : t.identifier.length;
  return [...byId.values()]
    .sort((a, b) => rank(a) - rank(b) || a.identifier.localeCompare(b.identifier))
    .map(topic => ({ value: topic.id, prefix: topic.identifier, get label() { return catalogueName(topic) } }));
}

export function countActiveFilters(filters: CqFilters): number {
  return Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v !== 'any').length;
}

function isConsolidated(cq: CompetencyQuestionReducedT): boolean {
  return cq.unifiedEntryKind === 'consolidation_result'
    || (cq.consolidations?.length ?? 0) > 0
    || (cq.noConsolidations ?? 0) > 0;
}

function matchesWithWithout(filter: string, present: boolean): boolean {
  return filter === 'any' || (filter === 'with') === present;
}

function matchesDateRange(filter: string, timestamp: string | null | undefined, now: number): boolean {
  if (filter === 'any') return true;
  if (filter === 'none') return !timestamp;
  const match = /^(within|older)_(\d+)d$/.exec(filter);
  if (!match || !timestamp) return false;
  const age = now - Date.parse(timestamp);
  const limit = Number(match[2]) * DAY_MS;
  return match[1] === 'within' ? age <= limit : age > limit;
}

/**
 * Filter state plus the derived author options and predicate for a list of CQs.
 * Pass `filters` to back the state with an existing ref (e.g. persisted store state).
 */
export function useCqFilters(
  getCqs: () => CompetencyQuestionReducedT[] | undefined,
  filters: Ref<CqFilters> = ref<CqFilters>({ ...DEFAULT_CQ_FILTERS }),
) {
  const store = useStore();
  filters.value = normalizeCqFilters(filters.value);
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
      { value: 'me', get label() { return t('me') } },
      ...others,
    ];
  });

  function matchesFilters(cq: CompetencyQuestionReducedT): boolean {
    const f = filters.value;

    if (f.author.length) {
      const authorIds = f.author.map(a => a === 'me' ? store.getUser.id : a);
      if (!cq.author?.id || !authorIds.includes(cq.author.id)) return false;
    }

    if (!matchesWithWithout(f.discussion, (cq.noComments ?? 0) > 0)) return false;

    const rating = cq.rating ?? 0;
    if (f.rating === 'unrated' && rating > 0) return false;
    if (f.rating === 'rated' && rating === 0) return false;
    if (/^\d$/.test(f.rating) && rating < Number(f.rating)) return false;

    if (f.type.length && !f.type.includes(cq.type ?? 'none')) return false;

    if (f.tag.length) {
      const tagIds = cq.tags?.length ? cq.tags.map(t => t.id) : ['none'];
      if (!tagIds.some(id => f.tag.includes(id))) return false;
    }

    if (!matchesWithWithout(f.sparql, !!cq.sparqlQuery?.trim())) return false;
    if (!matchesWithWithout(f.exampleAnswer, !!cq.exampleAnswer?.trim())) return false;

    if (f.consolidation === 'consolidated' && !isConsolidated(cq)) return false;
    if (f.consolidation === 'not_consolidated' && isConsolidated(cq)) return false;

    const now = Date.now();
    if (!matchesDateRange(f.created, cq.createdAt, now)) return false;
    if (!matchesDateRange(f.updated, cq.updatedAt, now)) return false;
    if (!matchesDateRange(f.lastComment, cq.lastCommentAt, now)) return false;

    return true;
  }

  return { filters, activeFilterCount, authorOptions, matchesFilters };
}
