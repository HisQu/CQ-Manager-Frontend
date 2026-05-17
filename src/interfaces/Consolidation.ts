type ConsolidationQuestionT = {
    id: string,
    question: string,
    aggregatedRating: number,
    anchor: string | null,
    comment: string | null,
    exampleAnswer: string | null,
    reference: string | null,
    sparqlQuery: string | null,
    type: CQType | null,
    cqCatalogueIdentifier?: string | null,
    group?: { id: string, name: string },
    author?: UserReducedT,
}

type ConsolidationReducedT = {
    id: string,
    targetQuestion?: ConsolidationQuestionT | null,
    engineer?: UserReducedT | null,
    noSourceQuestions: number,
}

type ConsolidationT = {
    id: string,
    targetQuestion?: ConsolidationQuestionT | null,
    project?: ProjectReducedT,
    engineer?: UserReducedT | null,
    sourceQuestions?: ConsolidationQuestionT[],
    noSourceQuestions: number,
}
