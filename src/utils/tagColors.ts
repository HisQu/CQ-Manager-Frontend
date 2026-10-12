// Full class strings so Tailwind's JIT picks them up.
const TAG_COLORS = [
  'bg-sky-50 text-sky-700 ring-sky-700/10 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/30',
  'bg-emerald-50 text-emerald-700 ring-emerald-700/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/30',
  'bg-amber-50 text-amber-800 ring-amber-700/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30',
  'bg-rose-50 text-rose-700 ring-rose-700/10 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/30',
  'bg-teal-50 text-teal-700 ring-teal-700/10 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/30',
  'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-700/10 dark:bg-fuchsia-400/10 dark:text-fuchsia-300 dark:ring-fuchsia-400/30',
  'bg-lime-50 text-lime-800 ring-lime-700/20 dark:bg-lime-400/10 dark:text-lime-300 dark:ring-lime-400/30',
  'bg-orange-50 text-orange-700 ring-orange-700/10 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/30',
];

/** Picks a stable colour for a tag from its (case-insensitive) name, so a tag looks the same everywhere. */
export function tagColorClasses(name: string): string {
  let hash = 0;
  for (const char of name.toLowerCase()) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

/** Mirrors the backend's normalisation: trim and collapse whitespace. */
export function normalizeTagName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).join(' ');
}

export const TAG_NAME_MAX_LENGTH = 50;
