import { t } from '../i18n'
export const CQ_TYPES: CQType[] = [
  "RQ", "SCQ", "VCQ", "FCQ", "RCQ", "aRCQ", "efRCQ", "drRCQ", "rpRCQ", "MpCQ",
]

export const CQ_TYPE_LABELS: Record<CQType, string> = {
  get RQ() { return t('rQLiterature') },
  get SCQ() { return t('sCQScoping') },
  get VCQ() { return t('vCQValidation') },
  get FCQ() { return t('fCQFoundational') },
  get RCQ() { return t('rCQRelationship') },
  get aRCQ() { return t('aRCQArity') },
  get efRCQ() { return t('efRCQElementary') },
  get drRCQ() { return t('drRCQDomainRange') },
  get rpRCQ() { return t('rpRCQRelationProperty') },
  get MpCQ() { return t('mpCQMetaproperty') },
}

type CQTypeHint = { purpose: string; mustInclude: string; answer: string }

export const CQ_TYPE_HINTS: Partial<Record<CQType, CQTypeHint>> = {
  RQ:    { get purpose() { return t('researchQuestionFromLiteratureAboutADomain') },                              get mustInclude() { return t('1DomainEntitySubjectDomain') },                                                                                                             get answer() { return t('nonEmptyContentSet') } },
  SCQ:   { get purpose() { return t('demarcateSubjectDomain') },                                                      get mustInclude() { return t('1DomainEntitySubjectDomainTargetOntology') },                                                                                           get answer() { return t('nonEmptyContentSet') } },
  VCQ:   { get purpose() { return t('verifyContentCoverage') },                                                       get mustInclude() { return t('1DomainEntityQueryLogicMustFitWithinTheOntologyLogic') },                                                                            get answer() { return t('contentOrYesNoMustBeFormalisable') } },
  FCQ:   { get purpose() { return t('alignDomainEntityToAFoundationalOntology') },                                get mustInclude() { return t('referenceToAnFOEntityOrItsProperty') },                                                                                                    get answer() { return t('yesNoNotApplicable') } },
  RCQ:   { get purpose() { return t('characteriseARelationshipArityParticipantsOrRelationalProperties') },     get mustInclude() { return t('exactlyOneRelationshipSubtypeDeterminesWhatElseIsRequired') },                                                                           get answer() { return t('numberARCQClassNamesDrRCQPropertyNameRpRCQ') } },
  aRCQ:  { get purpose() { return t('askForTheArityOfARelationship') },                                           get mustInclude() { return t('exactlyOneRelationship') },                                                                                                                      get answer() { return t('aNumberNoteOWLConstrainsAllObjectPropertiesToBinaryMakingThisTrivialInOWLContexts') } },
  efRCQ: { get purpose() { return t('askWhetherTheRelationshipIsElementaryCannotBeRephrasedWithoutLosingInformation') }, get mustInclude() { return t('exactlyOneRelationship') },                                                                                                       get answer() { return t('yesNo') } },
  drRCQ: { get purpose() { return t('nameTheDomainAndRangeClassesOfTheRelationship') },                         get mustInclude() { return t('exactlyOneRelationship') },                                                                                                                      get answer() { return t('classNamesVerifyTheseHaveUniversalNotMerelyLocalScope') } },
  rpRCQ: { get purpose() { return t('nameExactlyOneRelationalPropertyOfTheRelationship') },                      get mustInclude() { return t('exactlyOneRelationshipOnePropertyFromTransitivityReflexivityIrreflexivitySymmetryAsym') }, get answer() { return t('yesNoConfirmThePropertyIsExpressibleInYourRepresentationLanguage') } },
  MpCQ:  { get purpose() { return t('classifyAnEntityOntologicalNature') },                                         get mustInclude() { return t('exactlyOneMetametaPropertyRigidityIdentityUnityDependence') },                                                                        get answer() { return t('aMetapropertyValueEGRigidAntiRigidTelic') } },
}
