type AnnotationT = {
    passage: string,
    term: string,
    start: number,
    end: number,
    definition?: string | null,
    conceptIri?: string | null,
}

type AnnotationInCQT = {
    content: string,
    start: number,
    end: number,
    term: {
        content: string,
        id: string, // this is the term id
        definition?: string | null,
        conceptIri?: string | null,
    },
    id: string // this is the question-specific annotation occurrence id
}

type AnnotationOccurrenceT = {
    id: string,
    questionId: string,
    termId: string,
    content: string,
    start: number,
    end: number,
}
