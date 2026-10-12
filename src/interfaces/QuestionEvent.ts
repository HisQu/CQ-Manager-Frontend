type QuestionEventTypeT = 'created' | 'revised' | 'tag_added' | 'tag_removed' | 'catalogue_assigned' | 'deleted'

/** One entry of the provenance log of a CQ, see `GET /questions/{id}/history`. */
type QuestionEventT = {
    id: string,
    eventType: QuestionEventTypeT,
    createdAt: string,
    /** The revision the CQ had right after this event. */
    versionNumber: number,
    /** `null` for events imported from data that predates the log. */
    actor: UserReducedT | null,
    tagId: string | null,
    tagName: string | null,
    topicId: string | null,
    catalogueIdentifier: string | null,
}
