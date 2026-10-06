// Factories for test data. Every factory returns a valid default object;
// pass overrides for the fields a test cares about.

let seq = 0
const nextId = (prefix: string) => `${prefix}-${++seq}`

export function makeUser(overrides: Partial<UserReducedT> = {}): UserReducedT {
  const id = overrides.id ?? nextId('user')
  return { id, name: `User ${id}`, email: `${id}@example.org`, ...overrides }
}

export function makeGroup(overrides: Partial<{ id: string, name: string }> = {}) {
  const id = overrides.id ?? nextId('group')
  return { id, name: `Group ${id}`, ...overrides }
}

export function makeCq(overrides: Partial<CompetencyQuestionReducedT> = {}): CompetencyQuestionReducedT {
  const id = overrides.id ?? nextId('cq')
  const group = overrides.group ?? makeGroup()
  return {
    id,
    groupId: group.id,
    group,
    question: `Question ${id}?`,
    author: makeUser(),
    rating: 0,
    noComments: 0,
    noConsolidations: 0,
    consolidations: [],
    type: null,
    sparqlQuery: null,
    exampleAnswer: null,
    ...overrides,
  }
}

export function makeConsolidationQuestion(cq: CompetencyQuestionReducedT): ConsolidationQuestionT {
  return {
    id: cq.id,
    question: cq.question,
    aggregatedRating: 0,
    anchor: null,
    comment: null,
    exampleAnswer: null,
    reference: null,
    sparqlQuery: null,
    type: null,
    group: cq.group,
    author: cq.author,
  }
}

export function makeProject(overrides: Partial<ProjectReducedT> = {}): ProjectReducedT {
  const id = overrides.id ?? nextId('project')
  return {
    id,
    name: `Project ${id}`,
    description: '',
    noManagers: 0,
    noEngineers: 0,
    noGroups: 0,
    noConsolidations: 0,
    totalMembers: 0,
    ...overrides,
  }
}

export function makeConsolidation(overrides: Partial<ConsolidationT> = {}): ConsolidationT {
  return {
    id: nextId('consolidation'),
    targetQuestion: null,
    project: makeProject(),
    engineer: makeUser(),
    sourceQuestions: [],
    noSourceQuestions: overrides.sourceQuestions?.length ?? 0,
    ...overrides,
  }
}
