type TopicReducedT = {
    id: string,
    identifier: string,
    name: string,
}

type TopicT = {
    id: string,
    identifier: string,
    name: string,
    projectId: string,
    questions?: {
        id: string,
        question: string,
        type: CQType | null,
    }[],
}
