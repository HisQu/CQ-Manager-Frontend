type AnnotationProposalCandidateT = {
  proposalId: string,
  text: string,
  start: number,
  end: number,
  lemma: string,
  rule: string,
  tokens: Array<{text: string, lemma: string, pos: string, tag: string}>,
  matchStatus: string,
  matches: Array<Record<string, unknown>>,
  suggestedTerm: {
    id: string | null,
    content: string,
    definition: string | null,
    conceptIri: string | null,
    isNew: boolean,
  },
}

type AnnotationProposalResponseT = {
  questionId: string,
  revisionId: string,
  proposalRunId: string | null,
  candidates: AnnotationProposalCandidateT[],
  matcher: Record<string, unknown>,
  contextMatcher: Record<string, unknown>,
}
