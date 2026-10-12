import { t } from '../i18n'

/** Identifier of the catch-all catalogue every project has for CQs that are not part of a real catalogue. */
export const UNCATALOGUED_IDENTIFIER = '#';

export function isUncatalogued(topic: { identifier: string } | null | undefined): boolean {
  return topic?.identifier === UNCATALOGUED_IDENTIFIER;
}

/** Localize the built-in catch-all catalogue while preserving user-authored names. */
export function catalogueName(topic: { identifier: string; name: string }): string {
  return isUncatalogued(topic) ? t('uncatalogued') : topic.name
}
