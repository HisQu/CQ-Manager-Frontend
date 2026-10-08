/** Identifier of the catch-all catalogue every project has for CQs that are not part of a real catalogue. */
export const UNCATALOGUED_IDENTIFIER = '#';

export function isUncatalogued(topic: { identifier: string } | null | undefined): boolean {
  return topic?.identifier === UNCATALOGUED_IDENTIFIER;
}
