type TermT = {
    id: string,
    content: string,
    projectId: string,
    definition?: string | null,
    conceptIri?: string | null,
    /** How many CQs currently annotate this term; only set in a project's glossary. */
    noQuestions?: number,
};