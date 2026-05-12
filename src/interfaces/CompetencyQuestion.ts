type CQType = "SCQ" | "VCQ" | "FCQ" | "RCQ" | "aRCQ" | "efRCQ" | "drRCQ" | "rpRCQ" | "MpCQ"

type CompetencyQuestionT = {
    id: string,
    groupId: string,
    question: string,
    sparqlQuery: string | null,
    aggregatedRating: number,
    ratings?: Array<RatingT>,
    author: UserT,
    noConsolidations: number,
    annotations: Array<AnnotationT>,
    versions: {
        editor: {
            name: string,
            id: string,
        },
        questionString: string,
        versionNumber: number
    },
    group: GroupT,
    comment: string | null,
    reference: string | null,
    anchor: string | null,
    exampleAnswer: string | null,
    type: CQType | null,
    topicId: string | null,
    topic: TopicReducedT | null,
    cqCatalogueIdentifier: string | null,
}

type CompetencyQuestionReducedT = {
    id: string,
    groupId: string,
    group?: {
        id: string,
        name: string
    },
    question: string,
    author?: UserReducedT,
    creator?: string,
    aggregatedRating?: number,
    rating?: number,
    noConsolidations?: number,
    comment?: string | null,
    reference?: string | null,
    anchor?: string | null,
    exampleAnswer?: string | null,
    type?: CQType | null,
    topicId?: string | null,
    topic?: TopicReducedT | null,
    cqCatalogueIdentifier?: string | null,
    unifiedEntryKind?: 'question' | 'consolidation_result',
    consolidationId?: string,
    consolidatedQuestionIds?: string[],
}

type CompetencyQuestionReferenceT = {
    id: string,
    author: UserReducedT
    group: {
        id: string,
        name: string
    },
    question: string
}
