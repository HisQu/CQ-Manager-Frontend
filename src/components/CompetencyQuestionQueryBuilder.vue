<script setup lang="ts">
import {computed, ref, toRefs, watch} from "vue";
import {ArrowDownOnSquareIcon, TrashIcon} from "@heroicons/vue/24/solid";
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
  annotations?: AnnotationInCQT[];
  canEdit: boolean;
  groupId?: string;
  id?: string;
  projectId: string;
}>()
const {annotations} = toRefs(props)
const annotationItems = computed(() => annotations.value ?? [])
const emits = defineEmits(['saveCompetencyQuestion', 'fetchCompetencyQuestion'])

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
  // on updating a question, check if existing annoations become invalid by checking if the annotationtext 
  // is still the same as the text in the question at the stored annotation start/end positions. 
  const invalidAnnotations = annotationItems.value.some((annotation) =>
    localQuestion.value.slice(annotation.start, annotation.end) !== annotation.content,
  );
  let discardAnnotations = false;

  if (invalidAnnotations) {
    discardAnnotations = window.confirm(
      "Changing this question text will invalidate its existing term annotations. Save the question and delete all of its annotations?",
    );
    if (!discardAnnotations) return;
  }

  emits('saveCompetencyQuestion', {
    question: localQuestion.value,
    sparqlQuery: localSparqlQuery.value || null,
    comment: localComment.value,
    reference: localReference.value,
    anchor: localAnchor.value,
    exampleAnswer: localExampleAnswer.value,
    type: localType.value,
    discardAnnotations,
  });
}
</script>

<template>
  <div>
    <label for="question"
           class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">{{ $t('question') }}</label>
    <div class="mt-2">
      <textarea name="question" id="question" rows="4"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
             v-model="localQuestion"
      ></textarea>
    </div>
    <div class="mt-4">
      <label for="cq_comment" class="block text-sm font-medium leading-6 dark:text-gray-200 text-gray-900">{{ $t('comment') }}</label>
      <div class="mt-2">
        <textarea id="cq_comment" rows="3"
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

    <section v-if="props.id" class="mt-10">
      <h3 class="mb-3 text-xl">Term Annotations</h3>
      <p v-if="questionTextChanged && props.canEdit" class="mb-2 text-sm text-amber-700 dark:text-amber-300">
        Save the question text before adding or changing annotations.
      </p>
      <TermAnnotationSpanEditor
        :text="localQuestion"
        :annotations="annotationItems"
        :can-edit="props.canEdit && !questionTextChanged"
        :question-id="props.id"
        :project-id="props.projectId"
        @updated="$emit('fetchCompetencyQuestion')" />
    </section>

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
