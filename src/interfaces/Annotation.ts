type AnnotationT = {
    passage: string,
    term: string,
    definition?: string | null,
    conceptIri?: string | null,
}

type AnnotationInCQT = {
    content: string,
    term: {
        content: string,
        id: string, // this is the term id
        definition?: string | null,
        conceptIri?: string | null,
    },
    id: string // this is the passage id
}