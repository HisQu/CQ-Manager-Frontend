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

type AnnotationVersionT = {
    id: string,
    versionNumber: number,
    retainedFromAnnotationVersionId: string | null,
    editor: {id: string, email: string, name: string},
    annotations: AnnotationInCQT[],
}

type AnnotationVersionSaveT = {
    id: string,
    questionVersionId: string,
    versionNumber: number,
    retainedFromAnnotationVersionId: string | null,
    editorId: string,
    annotations: Array<{
        id: string,
        annotationVersionId: string,
        content: string,
        start: number,
        end: number,
        termId: string,
    }>,
}

type QuestionRevisionT = {
    id: string,
    questionString: string,
    sparqlQuery: string | null,
    exampleAnswer: string | null,
    versionNumber: number,
    editor: {id: string, email: string, name: string},
    annotationVersions: AnnotationVersionT[],
}
