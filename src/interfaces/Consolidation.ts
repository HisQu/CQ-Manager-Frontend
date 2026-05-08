type ConsolidationReducedT = {
    id: string,
    resultQuestionId: string | null,
    resultQuestion?: CompetencyQuestionReducedT | null,
    engineer?: UserReducedT | null,
    noQuestions: number,
}

type ConsolidationT = {
    id: string,
    resultQuestionId: string | null,
    resultQuestion?: CompetencyQuestionReducedT | null,
    project?: ProjectReducedT,
    engineer?: UserReducedT | null,
    questions?: CompetencyQuestionReducedT[],
    noQuestions: number,
}
