type GroupT = {
    id: string,
    name: string,
    project: ProjectFullT,
    noMembers: number,
    noQuestions: number,
    createdAt: string,
    updatedAt: string
};

type GroupFullT = {
    name: string,
    project: {
        name: string,
        description: string | null,
        id: string,
        createdAt: string,
        updatedAt: string
    },
    members: {
        email: string,
        name: string,
        id: string
    }[],
    questions: {
        author: {
            email: string,
            name: string,
            id: string
        },
        aggregatedRating: number,
        question: string
    }[],
    noMembers: number,
    noQuestions: number,
    id: string,
    createdAt: string,
    updatedAt: string
}
