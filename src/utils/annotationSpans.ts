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

/** Split text at annotation boundaries and record every span covering each segment. */
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

/** Split boundary segments into whitespace-preserving chunks for inline bar layout. */
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
