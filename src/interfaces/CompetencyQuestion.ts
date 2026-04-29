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
}

type CompetencyQuestionReducedT = {
    id: string,
    groupId: string,
    group?: {
        id: string,
        name: string
    },
    question: string,
    author: UserReducedT,
    aggregatedRating: number,
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
