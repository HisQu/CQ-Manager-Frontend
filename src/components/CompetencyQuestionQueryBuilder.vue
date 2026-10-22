<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {ArrowDownOnSquareIcon, ChevronDownIcon, TrashIcon} from "@heroicons/vue/24/solid";
import CompetencyQuestionDataService from "../services/CompetencyQuestionDataService.ts";
import SubmitButtonWithCallback from "./SubmitButtonWithCallback.vue";
import SparqlEditor from "./SparqlEditor.vue";
import TermAnnotationSpanEditor from "./TermAnnotationSpanEditor.vue";
import CqTypeSelect from "./CqTypeSelect.vue";


const props = defineProps<{
  question: string;
  sparqlQuery?: string | null;
  comment?: string | null;
  reference?: string | null;
  anchor?: string | null;
  exampleAnswer?: string | null;
  type?: CQType | null;
  revisions?: QuestionRevisionT[];
  canEdit: boolean;
  groupId?: string;
  id?: string;
  projectId: string;
  sparqlTarget?: string;
}>()

const {t} = useI18n()
const emits = defineEmits(['saveCompetencyQuestion', 'fetchCompetencyQuestion'])
const annotationSection = ref<HTMLElement | null>(null)
const selectedRevisionId = ref("")
const selectedAnnotationVersionId = ref("")
const expandedRevisionIds = ref<string[]>([])
const orderedRevisions = computed(() => [...(props.revisions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber))

watch(() => props.revisions, (revisions = []) => {
  const newestRevision = [...revisions].sort((a, b) => b.versionNumber - a.versionNumber)[0]
  if (!newestRevision) return
  const newestAnnotationVersion = [...(newestRevision.annotationVersions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber)[0]
  selectedRevisionId.value = newestRevision.id
  selectedAnnotationVersionId.value = newestAnnotationVersion?.id ?? ""
  expandedRevisionIds.value = [newestRevision.id]
}, {immediate: true, deep: true})

function isRevisionExpanded(revisionId: string) {
  return expandedRevisionIds.value.includes(revisionId)
}

function toggleRevision(revisionId: string) {
  expandedRevisionIds.value = isRevisionExpanded(revisionId)
    ? expandedRevisionIds.value.filter((id) => id !== revisionId)
    : [...expandedRevisionIds.value, revisionId]
}

function selectAnnotationVersion(revision: QuestionRevisionT, annotationVersion: AnnotationVersionT) {
  selectedRevisionId.value = revision.id
  selectedAnnotationVersionId.value = annotationVersion.id
  if (!isRevisionExpanded(revision.id)) expandedRevisionIds.value = [...expandedRevisionIds.value, revision.id]
  requestAnimationFrame(() => annotationSection.value?.scrollIntoView({behavior: "smooth", block: "start"}))
}

function wasRetainedFromPreviousRevision(revision: QuestionRevisionT, annotationVersion: AnnotationVersionT): boolean {
  return annotationVersion.versionNumber === 1
    && Boolean(annotationVersion.retainedFromAnnotationVersionId)
    && revision.versionNumber > 1;
}

// Annotations whose text changed are not carried forward, so a retained version can hold fewer than its source.
function annotationVersionLabel(revision: QuestionRevisionT, annotationVersion: AnnotationVersionT): string {
  if (!wasRetainedFromPreviousRevision(revision, annotationVersion)) return t('historyAnnotationRevised')
  const source = (props.revisions ?? [])
    .flatMap(({annotationVersions}) => annotationVersions ?? [])
    .find(({id}) => id === annotationVersion.retainedFromAnnotationVersionId)
  const retained = annotationVersion.annotations.length
  const total = source?.annotations.length ?? retained
  return retained < total
    ? t('historyAnnotationPartiallyRetained', {retained, total})
    : t('historyAnnotationRetained')
}

const localQuestion = ref<string>(props.question ?? '')
const localSparqlQuery = ref<string>(props.sparqlQuery ?? '')
const localComment = ref<string | null>(props.comment ?? null)
const localReference = ref<string | null>(props.reference ?? null)
const localAnchor = ref<string | null>(props.anchor ?? null)
const localExampleAnswer = ref<string | null>(props.exampleAnswer ?? null)
const localType = ref<CQType | null>(props.type ?? null)
const questionTextChanged = computed(() => localQuestion.value !== (props.question ?? ''))

watch(() => props.question, (val) => { localQuestion.value = val ?? '' })
watch(() => props.sparqlQuery, (val) => { localSparqlQuery.value = val ?? '' })
watch(() => props.comment, (val) => { localComment.value = val ?? null })
watch(() => props.reference, (val) => { localReference.value = val ?? null })
watch(() => props.anchor, (val) => { localAnchor.value = val ?? null })
watch(() => props.exampleAnswer, (val) => { localExampleAnswer.value = val ?? null })
watch(() => props.type, (val) => { localType.value = val ?? null })

function saveQuestion() {
  emits('saveCompetencyQuestion', {
    question: localQuestion.value,
    sparqlQuery: localSparqlQuery.value || null,
    comment: localComment.value,
    reference: localReference.value,
    anchor: localAnchor.value,
    exampleAnswer: localExampleAnswer.value,
    type: localType.value,
  });
}
</script>

<template>
  <div>
    <label for="question"
           class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">{{ $t('question') }}</label>
    <div class="mt-2">
      <textarea name="question" id="question" rows="2"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
             v-model="localQuestion"
      ></textarea>
    </div>
    <div class="mt-4">
      <label for="cq_comment" class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">{{ $t('comment') }}</label>
      <div class="mt-2">
        <textarea id="cq_comment" rows="6"
                  :disabled="!canEdit"
                  v-model="localComment"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
        ></textarea>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <CqTypeSelect v-model="localType" :disabled="!canEdit" />
      <div>
        <label for="cq_reference" class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">
          {{ $t('referenceFundstelle') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span>
        </label>
        <div class="mt-2">
          <input type="text" id="cq_reference"
                 :disabled="!canEdit"
                 v-model="localReference"
                 :placeholder="$t('eGS138')"
                 class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"/>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <label for="cq_anchor" class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">
        {{ $t('anchorBeleganker') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span>
      </label>
      <div class="mt-2">
        <textarea id="cq_anchor" rows="2"
                  :disabled="!canEdit"
                  v-model="localAnchor"
                  :placeholder="$t('sourceTextOrEvidenceFromWhichTheCQWasExtracted')"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
        ></textarea>
      </div>
    </div>

    <div class="mt-4">
      <label for="cq_example_answer" class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">
        {{ $t('exampleAnswer') }} <span class="font-normal text-gray-500 dark:text-gray-400">{{ $t('optional') }}</span>
      </label>
      <div class="mt-2">
        <textarea id="cq_example_answer" rows="2"
                  :disabled="!canEdit"
                  v-model="localExampleAnswer"
                  :placeholder="$t('sampleOrExampleAnswer')"
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
        ></textarea>
      </div>
    </div>

    <section v-if="props.id" ref="annotationSection" class="mt-10 scroll-mt-6">
      <h3 class="mb-3 text-xl">Term Annotations</h3>
      <p v-if="questionTextChanged && props.canEdit" class="mb-2 text-sm text-amber-700 dark:text-amber-300">
        Save the question text before adding or changing annotations.
      </p>
      <TermAnnotationSpanEditor
        :text="localQuestion"
        :revisions="props.revisions ?? []"
        :selected-revision-id="selectedRevisionId"
        :selected-annotation-version-id="selectedAnnotationVersionId"
        :question-text-changed="questionTextChanged"
        :can-edit="props.canEdit && !questionTextChanged"
        :question-id="props.id"
        :project-id="props.projectId"
        @updated="$emit('fetchCompetencyQuestion')" />
    </section>

    <!-- Rendered at sparqlTarget (e.g. below the change log) when given, otherwise in place -->
    <Teleport defer :to="props.sparqlTarget" :disabled="!props.sparqlTarget">
    <div class="mt-6">
      <label for="sparqlQuery"
             class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">{{ $t('sPARQLQuery') }}</label>
      <div class="mt-2">
        <SparqlEditor v-if="canEdit"
                      v-model="localSparqlQuery"
        />
        <SparqlEditor v-else-if="props.sparqlQuery"
                      :model-value="props.sparqlQuery"
                      :readonly="true"
        />
        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">{{ $t('noSPARQLQueryDefined') }}</p>
      </div>
    </div>
    </Teleport>

    <section v-if="props.id && orderedRevisions.length" class="mt-8">
      <h3 class="mb-3 text-lg font-semibold dark:text-white">{{ $t('versionHistory2') }}</h3>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div v-for="revision in orderedRevisions" :key="revision.id">
          <div class="flex items-start gap-2 px-3 py-2.5">
            <button type="button"
                    class="mt-0.5 rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    :aria-label="`${isRevisionExpanded(revision.id) ? $t('collapse') : $t('expand')} ${$t('questionVersion')} ${revision.versionNumber}`"
                    :aria-expanded="isRevisionExpanded(revision.id)"
                    @click="toggleRevision(revision.id)">
              <ChevronDownIcon class="h-4 w-4 transition-transform" :class="isRevisionExpanded(revision.id) ? 'rotate-0' : '-rotate-90'" />
            </button>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                  v{{ revision.versionNumber }}
                </span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ revision.editor.name }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('historyRevised') }}</span>
              </div>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ revision.questionString }}</p>
              <p v-if="revision.exampleAnswer" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span class="font-medium">{{ $t('exampleAnswer') }}:</span> {{ revision.exampleAnswer }}
              </p>
              <pre v-if="revision.sparqlQuery" class="mt-1 overflow-x-auto rounded bg-white/70 p-2 text-xs text-gray-600 dark:bg-gray-900/40 dark:text-gray-400">{{ revision.sparqlQuery }}</pre>
            </div>
          </div>
          <div v-if="isRevisionExpanded(revision.id)" class="py-1 pl-11 pr-3">
            <button v-for="annotationVersion in [...(revision.annotationVersions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber)"
                    :key="annotationVersion.id"
                    type="button"
                    class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    :class="selectedAnnotationVersionId === annotationVersion.id ? 'font-semibold text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'"
                    :aria-pressed="selectedAnnotationVersionId === annotationVersion.id"
                    @click="selectAnnotationVersion(revision, annotationVersion)">
              <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/30">
                v{{ annotationVersion.versionNumber }}
              </span>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ annotationVersion.editor.name }}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ annotationVersionLabel(revision, annotationVersion) }}</span>
            </button>
            <p v-if="!(revision.annotationVersions ?? []).length" class="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">{{ $t('noAnnotationVersions') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-if="canEdit" class="mt-5 flex flex-row-reverse">
    <button
        @click="saveQuestion"
        type="button"
        class="float-right inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
      <ArrowDownOnSquareIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
      {{ $t('save') }}
    </button>
    <div class="mr-5" v-if="$props.id">
      <SubmitButtonWithCallback :agree-button-text="$t('deleteTheQuestion')"
                                :title="$t('areYouSureYouWantToDeleteTheQuestion')"
                                :detail="$t('thisActionIsPermanentAllCommentsRatingsAndConsolidationsWillBeDeleted')"
                                @modalsuccessclose="CompetencyQuestionDataService.delete(props.id ?? ''); $router.push('/questions/');">
        <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true"/>
        {{ $t('delete') }}
      </SubmitButtonWithCallback>
    </div>
  </div>
</template>

<style scoped>

</style>
