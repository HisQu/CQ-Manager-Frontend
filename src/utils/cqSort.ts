import {UNCATALOGUED_IDENTIFIER} from "./catalogues.ts";

export type CqSortField =
  | 'catalogue'
  | 'question'
  | 'created'
  | 'updated'
  | 'lastComment'
  | 'rating'
  | 'comments'
  | 'consolidations'
  | 'author'
  | 'group'
  | 'type';

export type CqSortDirection = 'asc' | 'desc';

export type CqSort = { field: CqSortField; direction: CqSortDirection };

export const DEFAULT_CQ_SORT: CqSort = { field: 'catalogue', direction: 'asc' };

// `defaultDirection` is what users usually want first: newest / best / most first for numbers and dates.
export const CQ_SORT_FIELDS: { value: CqSortField; label: string; defaultDirection: CqSortDirection }[] = [
  { value: 'catalogue', label: 'Catalogue ID', defaultDirection: 'asc' },
  { value: 'question', label: 'Question', defaultDirection: 'asc' },
  { value: 'created', label: 'Created', defaultDirection: 'desc' },
  { value: 'updated', label: 'Last edited', defaultDirection: 'desc' },
  { value: 'lastComment', label: 'Last comment', defaultDirection: 'desc' },
  { value: 'rating', label: 'Rating', defaultDirection: 'desc' },
  { value: 'comments', label: 'Number of comments', defaultDirection: 'desc' },
  { value: 'consolidations', label: 'Number of consolidations', defaultDirection: 'desc' },
  { value: 'author', label: 'Author', defaultDirection: 'asc' },
  { value: 'group', label: 'Group', defaultDirection: 'asc' },
  { value: 'type', label: 'Type', defaultDirection: 'asc' },
];

export function defaultDirectionOf(field: CqSortField): CqSortDirection {
  return CQ_SORT_FIELDS.find(f => f.value === field)?.defaultDirection ?? 'asc';
}

/** Clicking the active field flips the direction; another field starts with its default direction. */
export function toggleCqSort(current: CqSort, field: CqSortField): CqSort {
  if (current.field === field) {
    return { field, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { field, direction: defaultDirectionOf(field) };
}

type SortKey = number | string | null;

/** Catalogues in identifier order (A … Z, AA …) with the uncatalogued catch-all last. */
function catalogueRank(identifier: string): number {
  if (identifier === UNCATALOGUED_IDENTIFIER) return Number.MAX_SAFE_INTEGER;
  let rank = 0;
  for (const char of identifier.toUpperCase()) rank = rank * 26 + (char.charCodeAt(0) - 64);
  return rank;
}

function catalogueKey(cq: CompetencyQuestionReducedT): number | null {
  const match = /^(.+)\.(\d+)$/.exec(cq.cqCatalogueIdentifier ?? '');
  if (!match) return null;
  // Catalogue indices stay far below 1e6, so one number orders by catalogue first, then by index.
  return catalogueRank(match[1]) * 1e6 + Number(match[2]);
}

function timestampKey(value: string | null | undefined): SortKey {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

function textKey(value: string | null | undefined): SortKey {
  return value?.trim() ? value.trim() : null;
}

function sortKey(cq: CompetencyQuestionReducedT, field: CqSortField): SortKey {
  switch (field) {
    case 'catalogue': return catalogueKey(cq);
    case 'question': return textKey(cq.question);
    case 'created': return timestampKey(cq.createdAt);
    case 'updated': return timestampKey(cq.updatedAt);
    case 'lastComment': return timestampKey(cq.lastCommentAt);
    case 'rating': return cq.rating ?? cq.aggregatedRating ?? 0;
    case 'comments': return cq.noComments ?? 0;
    case 'consolidations': return cq.noConsolidations ?? cq.consolidations?.length ?? 0;
    case 'author': return textKey(cq.author?.name || cq.author?.email || cq.creator);
    case 'group': return textKey(cq.group?.name);
    case 'type': return textKey(cq.type);
  }
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compareKeys(a: SortKey, b: SortKey): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * Returns a sorted copy. CQs without a value for the field (no comments yet, no type, …) always come last,
 * whatever the direction; ties fall back to the catalogue order so the result is stable.
 */
export function sortCqs<T extends CompetencyQuestionReducedT>(cqs: readonly T[], sort: CqSort): T[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  const keyed = cqs.map(cq => ({ cq, key: sortKey(cq, sort.field), fallback: catalogueKey(cq) }));
  keyed.sort((a, b) => {
    if (a.key === null || b.key === null) {
      if (a.key !== b.key) return a.key === null ? 1 : -1;
    } else {
      const result = compareKeys(a.key, b.key);
      if (result !== 0) return sign * result;
    }
    if (a.fallback === null || b.fallback === null) {
      return a.fallback === b.fallback ? 0 : a.fallback === null ? 1 : -1;
    }
    return a.fallback - b.fallback;
  });
  return keyed.map(k => k.cq);
}
