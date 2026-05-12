export const CQ_TYPES: CQType[] = [
  "LCQ", "SCQ", "VCQ", "FCQ", "RCQ", "aRCQ", "efRCQ", "drRCQ", "rpRCQ", "MpCQ",
]

export const CQ_TYPE_LABELS: Record<CQType, string> = {
  LCQ:   'LCQ – Literature',
  SCQ:   'SCQ – Scoping',
  VCQ:   'VCQ – Validation',
  FCQ:   'FCQ – Foundational',
  RCQ:   'RCQ – Relationship',
  aRCQ:  'aRCQ – arity',
  efRCQ: 'efRCQ – elementary',
  drRCQ: 'drRCQ - domain+range',
  rpRCQ: 'rpRCQ – relation property',
  MpCQ:  'MpCQ – Metaproperty',
}

type CQTypeHint = { purpose: string; mustInclude: string; answer: string }

export const CQ_TYPE_HINTS: Partial<Record<CQType, CQTypeHint>> = {
  LCQ:   { purpose: 'Research question from literature about a domain',                              mustInclude: '>=1 domain entity, subject domain',                                                                                                             answer: 'Non-empty content set' },
  SCQ:   { purpose: 'Demarcate subject domain',                                                      mustInclude: '>=1 domain entity, subject domain, target ontology',                                                                                           answer: 'Non-empty content set' },
  VCQ:   { purpose: 'Verify content coverage',                                                       mustInclude: '>=1 domain entity; query logic must fit within the ontology logic',                                                                            answer: 'Content or yes/no; must be formalisable' },
  FCQ:   { purpose: 'Align domain entity to a foundational ontology',                                mustInclude: 'Reference to an FO entity or its property',                                                                                                    answer: 'yes / no / not applicable' },
  RCQ:   { purpose: 'Characterise a relationship arity, participants, or relational properties',     mustInclude: 'Exactly one relationship; subtype determines what else is required',                                                                           answer: 'Number (aRCQ), class names (drRCQ), property name (rpRCQ)' },
  aRCQ:  { purpose: 'Ask for the arity of a relationship',                                           mustInclude: 'Exactly one relationship',                                                                                                                      answer: 'A number (note: OWL constrains all object properties to binary, making this trivial in OWL contexts)' },
  efRCQ: { purpose: 'Ask whether the relationship is elementary (cannot be rephrased without losing information)', mustInclude: 'Exactly one relationship',                                                                                                       answer: 'yes / no' },
  drRCQ: { purpose: 'Name the domain and range classes of the relationship',                         mustInclude: 'Exactly one relationship',                                                                                                                      answer: 'Class names (verify these have universal, not merely local, scope)' },
  rpRCQ: { purpose: 'Name exactly one relational property of the relationship',                      mustInclude: 'Exactly one relationship; one property from {transitivity, reflexivity, irreflexivity, symmetry, asymmetry, antisymmetry, acyclicity, intransitivity}', answer: 'yes / no (confirm the property is expressible in your representation language)' },
  MpCQ:  { purpose: 'Classify an entity ontological nature',                                         mustInclude: 'Exactly one metameta-property (rigidity, identity, unity, dependence)',                                                                        answer: 'A metaproperty value (e.g., rigid, anti-rigid, telic)' },
}
