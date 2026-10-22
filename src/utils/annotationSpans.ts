export interface AnnotationSpanLike {
  id: string;
  content: string;
  start: number;
  end: number;
  term: { content: string };
}

export interface AnnotationTextSegment<T extends AnnotationSpanLike> {
  start: number;
  end: number;
  text: string;
  annotations: T[];
}

export interface AnnotationSpanLane<T extends AnnotationSpanLike> {
  annotation: T;
  lane: number;
}

/** Split text at annotation boundaries (start/end offsets) and divide the question at each one. */
export function buildAnnotationTextSegments<T extends AnnotationSpanLike>(
  text: string,
  annotations: readonly T[],
): Array<AnnotationTextSegment<T>> {
  if (!text) return [];

  const boundaries = new Set<number>([0, text.length]);
  annotations.forEach(({ start, end }) => {
    boundaries.add(start);
    boundaries.add(end);
  });

  const sorted = [...boundaries].sort((left, right) => left - right);
  const segments: Array<AnnotationTextSegment<T>> = [];
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const start = sorted[index];
    const end = sorted[index + 1];
    if (end <= start) continue;
    segments.push({
      start,
      end,
      text: text.slice(start, end),
      annotations: annotations.filter((annotation) => annotation.start < end && annotation.end > start),
    });
  }
  return segments;
}

function spansOverlap<T extends AnnotationSpanLike>(left: T, right: T): boolean {
  return left.start < right.end && left.end > right.start;
}

/** Assign stable lanes so overlapping spans render on separate rows. */
export function assignAnnotationSpanLanes<T extends AnnotationSpanLike>(
  annotations: readonly T[],
): Array<AnnotationSpanLane<T>> {
  const ordered = [...annotations].sort((left, right) =>
    (right.end - right.start) - (left.end - left.start)
    || left.start - right.start
    || right.end - left.end
    || left.term.content.localeCompare(right.term.content),
  );
  const placed: Array<AnnotationSpanLane<T>> = [];
  const laneById = new Map<string, number>();

  // for overlapping lanes the largest span gets placed first (nearest to the text), 
  // and the smaller spans are placed in the next available lane above it. 
  ordered.forEach((annotation) => {
    const overlappingLanes = placed
      .filter((item) => spansOverlap(annotation, item.annotation))
      .map((item) => item.lane);
    const lane = overlappingLanes.length ? Math.max(...overlappingLanes) + 1 : 0;
    placed.push({ annotation, lane });
    laneById.set(annotation.id, lane);
  });

  return annotations.map((annotation) => ({
    annotation,
    lane: laneById.get(annotation.id) ?? 0,
  }));
}

/** Split the given segments into smaller segments at whitespace boundaries so that only one word is in each segment. */
export function splitAnnotationTextSegments<T extends AnnotationSpanLike>(
  segments: Array<AnnotationTextSegment<T>>,
): Array<AnnotationTextSegment<T>> {
  const pattern = /\S+[^\S\r\n]*|[^\S\r\n]+|[\r\n]+/g;
  return segments.flatMap((segment) => {
    const chunks: Array<AnnotationTextSegment<T>> = [];
    pattern.lastIndex = 0;
    let match = pattern.exec(segment.text);
    while (match) {
      const start = segment.start + match.index;
      chunks.push({ ...segment, start, end: start + match[0].length, text: match[0] });
      match = pattern.exec(segment.text);
    }
    return chunks.length ? chunks : [segment];
  });
}

/** Shrink a [start, end) span so it excludes leading and trailing whitespace (e.g. the space a double-click selects). */
export function trimSpanWhitespace(text: string, start: number, end: number): { start: number; end: number } {
  while (start < end && /\s/.test(text[start])) start += 1;
  while (end > start && /\s/.test(text[end - 1])) end -= 1;
  return { start, end };
}

function commonPrefix(left: string, right: string, limit: number): number {
  let length = 0;
  while (length < limit && left[length] === right[length]) length += 1;
  return length;
}

function commonSuffix(left: string, right: string, limit: number): number {
  let length = 0;
  while (length < limit && left[left.length - 1 - length] === right[right.length - 1 - length]) length += 1;
  return length;
}

/**
 * Move spans along with one text edit, as made by typing, pasting or deleting in a text field.
 * The edit lies between the common prefix and suffix of both texts: spans before it stay,
 * spans after it shift by the change in length, and spans it touches are dropped.
 * Repeated characters make the edit's position ambiguous ("Petent" -> "PPetent"), so a span is kept
 * if it survives either the longest-prefix or the longest-suffix reading of the edit.
 * Offsets are UTF-16 code units, like JavaScript string indices and the stored spans.
 */
export function moveSpansThroughEdit<T extends { content: string; start: number; end: number }>(
  before: string,
  after: string,
  spans: readonly T[],
): T[] {
  const shorter = Math.min(before.length, after.length);
  const shift = after.length - before.length;
  const prefixFirst = commonPrefix(before, after, shorter);
  const suffixFirst = commonSuffix(before, after, shorter);
  const readings = [
    {prefix: prefixFirst, editEnd: before.length - commonSuffix(before, after, shorter - prefixFirst)},
    {prefix: commonPrefix(before, after, shorter - suffixFirst), editEnd: before.length - suffixFirst},
  ];

  return spans.flatMap((span) => {
    for (const {prefix, editEnd} of readings) {
      const moved = span.end <= prefix ? span
        : span.start >= editEnd ? {...span, start: span.start + shift, end: span.end + shift}
        : null;
      if (moved && after.slice(moved.start, moved.end) === moved.content) return [moved];
    }
    return [];
  });
}
