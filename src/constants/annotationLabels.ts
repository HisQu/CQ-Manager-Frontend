export interface AnnotationLabelOption {
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  barColor: string;
}

function hashLabelName(labelName: string): number {
  let hash = 2166136261;
  for (let index = 0; index < labelName.length; index += 1) {
    hash ^= labelName.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Generate a repeatable hue from the term label. */
export function getAnnotationLabelOption(labelName: string): AnnotationLabelOption {
  const name = labelName.trim() || "Annotation";
  const hue = hashLabelName(name) % 360;
  return {
    name,
    backgroundColor: `hsl(${hue} 82% 94%)`,
    textColor: `hsl(${hue} 72% 24%)`,
    borderColor: `hsl(${hue} 70% 78%)`,
    barColor: `hsl(${hue} 72% 46%)`,
  };
}
