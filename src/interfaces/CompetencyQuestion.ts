type CompetencyQuestionT = {
    id: string,
    groupId: string,
    question: string,
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
    group: {
        id: string,
        name: string
    },
    question: string,
    author: UserReducedT,
    aggregatedRating: number
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
