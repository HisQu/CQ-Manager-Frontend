<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {
  CheckIcon,
  ChevronUpDownIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/vue/24/solid";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot,
} from "@headlessui/vue";
import TermDataService from "../services/TermDataService.ts";
import MessagePopup from "./MessagePopup.vue";
import {getAnnotationLabelOption} from "../constants/annotationLabels.ts";
import {
  AnnotationSpanLike,
  AnnotationTextSegment,
  assignAnnotationSpanLanes,
  buildAnnotationTextSegments,
  splitAnnotationTextSegments,
} from "../utils/annotationSpans.ts";

type AnnotationView = AnnotationInCQT & AnnotationSpanLike;

const props = defineProps<{
  text: string;
  annotations: AnnotationInCQT[];
  revisions: QuestionRevisionT[];
  selectedRevisionId: string;
  selectedAnnotationVersionId: string;
  canEdit: boolean;
  questionTextChanged: boolean;
  questionId: string;
  projectId: string;
}>();

const emit = defineEmits<{updated: []}>();

const textContainer = ref<HTMLElement | null>(null);
const terms = ref<TermT[]>([]);
const isEditing = ref(false);
const stagedAnnotations = ref<AnnotationInCQT[]>([]);
const term = ref<TermT | {content: string} | null>(null);
const query = ref("");
const newTermDefinition = ref("");
const newTermConceptIri = ref("");
const pendingSelection = ref<{start: number; end: number; content: string} | null>(null);
const editingAnnotationId = ref<string | null>(null);
const saving = ref(false);
const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false,
});
const newTermOption = computed(() => ({content: query.value.trim()}));
const latestRevision = computed(() => [...props.revisions].sort((a, b) => b.versionNumber - a.versionNumber)[0]);
const selectedRevision = computed(() => props.revisions.find(({id}) => id === props.selectedRevisionId) ?? latestRevision.value);
const currentRevision = computed(() => Boolean(selectedRevision.value && selectedRevision.value.id === latestRevision.value?.id));
const selectedAnnotationVersions = computed(() => [...(selectedRevision.value?.annotationVersions ?? [])].sort((a, b) => a.versionNumber - b.versionNumber));
const latestAnnotationVersion = computed(() => selectedAnnotationVersions.value[selectedAnnotationVersions.value.length - 1]);
const selectedAnnotationVersion = computed(() => selectedAnnotationVersions.value.find(({id}) => id === props.selectedAnnotationVersionId) ?? latestAnnotationVersion.value);
const currentAnnotationVersion = computed(() => Boolean(selectedAnnotationVersion.value && selectedAnnotationVersion.value.id === latestAnnotationVersion.value?.id));
const activeText = computed(() => currentRevision.value && !props.questionTextChanged
  ? props.text
  : (selectedRevision.value?.questionString ?? props.text));
const activeAnnotations = computed(() => isEditing.value ? stagedAnnotations.value : (selectedAnnotationVersion.value?.annotations ?? props.annotations));
const canEditSelected = computed(() => props.canEdit && currentRevision.value && currentAnnotationVersion.value && !props.questionTextChanged);
const hasStagedChanges = computed(() => {
  const normalize = (annotations: AnnotationInCQT[]) => annotations.map(({content, start, end, term: annotationTerm}) => ({
    content, start, end,
    term: annotationTerm.content,
    definition: annotationTerm.definition ?? null,
    conceptIri: annotationTerm.conceptIri ?? null,
  })).sort((left, right) => left.start - right.start || left.end - right.end || left.term.localeCompare(right.term));
  return JSON.stringify(normalize(stagedAnnotations.value)) !== JSON.stringify(normalize(selectedAnnotationVersion.value?.annotations ?? []));
});

watch(() => [props.selectedRevisionId, props.selectedAnnotationVersionId], () => {
  isEditing.value = false;
  stagedAnnotations.value = [];
  closeSelection();
});

const validAnnotations = computed<AnnotationView[]>(() => activeAnnotations.value.filter((annotation) =>
  annotation.start >= 0
  && annotation.end > annotation.start
  && annotation.end <= activeText.value.length
  && activeText.value.slice(annotation.start, annotation.end) === annotation.content,
));
const lanes = computed(() => assignAnnotationSpanLanes(validAnnotations.value));
const laneById = computed(() => new Map(lanes.value.map(({annotation, lane}) => [annotation.id, lane])));
const maxLane = computed(() => lanes.value.reduce((max, item) => Math.max(max, item.lane), -1));
const displaySegments = computed(() => {
  const raw = buildAnnotationTextSegments(activeText.value, validAnnotations.value);
  return splitAnnotationTextSegments(raw);
});
const filteredTerms = computed(() => {
  if (!query.value.trim()) return terms.value;
  return terms.value.filter((item) => item.content.toLowerCase().includes(query.value.toLowerCase()));
});

watch(() => [props.projectId, props.canEdit] as const, fetchTerms, {immediate: true});
watch(() => [props.canEdit, canEditSelected.value] as const, ([canEdit, enabled]) => {
  if (!canEdit || !enabled) {
    isEditing.value = false;
    closeSelection();
  }
});
watch(() => [props.text, props.selectedAnnotationVersionId] as const, () => {
  if (pendingSelection.value) closeSelection();
});

async function fetchTerms() {
  if (!props.canEdit || !props.projectId) return;
  const response = await TermDataService.getAllForOneProject(props.projectId);
  if ("messageType" in response) {
    showMessage(response);
  } else {
    terms.value = response.data;
  }
}

function showMessage(response: UXResponse) {
  messagePopupData.value.uxresponse = {...messagePopupData.value.uxresponse, ...response};
  messagePopupData.value.open = true;
}

function getSourceTextOffset(container: HTMLElement, targetNode: Node, targetOffset: number): number | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let current = walker.nextNode();
  while (current) {
    const isSource = Boolean(current.parentElement?.closest("[data-annotation-source='true']"));
    if (isSource) {
      if (current === targetNode) return offset + targetOffset;
      offset += current.textContent?.length ?? 0;
    }
    current = walker.nextNode();
  }
  return null;
}

// on mouseup, capture the selected text by its start and end and store it in pendingSelection
function captureTextSelection() {
  if (!isEditing.value || !canEditSelected.value || !textContainer.value) return;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const container = textContainer.value;
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return;

  const start = getSourceTextOffset(container, range.startContainer, range.startOffset);
  const end = getSourceTextOffset(container, range.endContainer, range.endOffset);
  if (start === null || end === null || start === end) return;

  const normalizedStart = Math.min(start, end);
  const normalizedEnd = Math.max(start, end);
  const content = activeText.value.slice(normalizedStart, normalizedEnd);
  if (!content.trim()) return;
  pendingSelection.value = {start: normalizedStart, end: normalizedEnd, content};
  term.value = null;
  query.value = "";
}

function selectTerm(value: TermT | {content: string} | null) {
  term.value = value;
  if (value) {
    query.value = "id" in value ? "" : value.content;
    newTermDefinition.value = "id" in value ? value.definition ?? "" : "";
    newTermConceptIri.value = "id" in value ? value.conceptIri ?? "" : "";
  } else {
    newTermDefinition.value = "";
    newTermConceptIri.value = "";
  }
}

function displayTerm(value: unknown): string {
  return value && typeof value === "object" && "content" in value
    ? String((value as {content: unknown}).content ?? "")
    : "";
}

function updateQuery(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  query.value = value;
  if (term.value && "id" in term.value && value !== term.value.content) {
    term.value = null;
    newTermDefinition.value = "";
    newTermConceptIri.value = "";
  }
}

async function saveAnnotation() {
  if (!isEditing.value || !pendingSelection.value || !term.value?.content || saving.value) return;
  saving.value = true;
  let selectedTerm: TermT;
  if ("id" in term.value) {
    selectedTerm = term.value;
  } else {
    const termResponse = await TermDataService.createTerm(props.projectId, term.value.content, newTermDefinition.value || null, newTermConceptIri.value || null);
    if ("messageType" in termResponse) {
      saving.value = false;
      showMessage(termResponse);
      return;
    }
    selectedTerm = termResponse.data;
    terms.value = [selectedTerm, ...terms.value.filter(({id}) => id !== selectedTerm.id)];
  }
  const annotation: AnnotationInCQT = {
    id: editingAnnotationId.value ?? crypto.randomUUID(),
    content: pendingSelection.value.content,
    start: pendingSelection.value.start,
    end: pendingSelection.value.end,
    term: {
      id: selectedTerm.id,
      content: selectedTerm.content,
      definition: newTermDefinition.value || null,
      conceptIri: newTermConceptIri.value || null,
    },
  };
  if (editingAnnotationId.value) {
    stagedAnnotations.value = stagedAnnotations.value.map((item) => item.id === editingAnnotationId.value ? annotation : item);
  } else {
    stagedAnnotations.value = [...stagedAnnotations.value, annotation];
  }
  saving.value = false;
  closeSelection();
}

function editAnnotation(annotation: AnnotationInCQT) {
  if (!isEditing.value || !canEditSelected.value) return;
  editingAnnotationId.value = annotation.id;
  pendingSelection.value = {
    start: annotation.start,
    end: annotation.end,
    content: annotation.content,
  };
  term.value = terms.value.find((item) => item.id === annotation.term.id) ?? {
    id: annotation.term.id,
    content: annotation.term.content,
    projectId: props.projectId,
    definition: annotation.term.definition ?? null,
    conceptIri: annotation.term.conceptIri ?? null,
  };
  query.value = annotation.term.content;
  newTermDefinition.value = annotation.term.definition ?? "";
  newTermConceptIri.value = annotation.term.conceptIri ?? "";
  window.getSelection()?.removeAllRanges();
}

function removeAnnotation(annotation: AnnotationInCQT) {
  if (!isEditing.value || !canEditSelected.value) return;
  stagedAnnotations.value = stagedAnnotations.value.filter((item) => item.id !== annotation.id);
  if (editingAnnotationId.value === annotation.id) closeSelection();
}

function beginEditing() {
  if (!canEditSelected.value) return;
  stagedAnnotations.value = [...(selectedAnnotationVersion.value?.annotations ?? [])].map((annotation) => ({...annotation, term: {...annotation.term}}));
  isEditing.value = true;
}

function discardChanges() {
  stagedAnnotations.value = [];
  isEditing.value = false;
  closeSelection();
}

async function saveChanges() {
  const base = latestAnnotationVersion.value;
  const revision = selectedRevision.value;
  if (!isEditing.value || !hasStagedChanges.value || !base || !revision || saving.value) return;
  saving.value = true;
  const annotations: AnnotationT[] = stagedAnnotations.value.map((item) => ({
    term: item.term.content,
    passage: item.content,
    start: item.start,
    end: item.end,
    definition: item.term.definition ?? null,
    conceptIri: item.term.conceptIri ?? null,
  }));
  const response = await TermDataService.saveAnnotationVersion(props.questionId, revision.id, base.id, annotations);
  saving.value = false;
  if ("messageType" in response) {
    showMessage(response);
    return;
  }
  isEditing.value = false;
  closeSelection();
  emit("updated");
}

function closeSelection() {
  pendingSelection.value = null;
  editingAnnotationId.value = null;
  term.value = null;
  query.value = "";
  newTermDefinition.value = "";
  newTermConceptIri.value = "";
  window.getSelection()?.removeAllRanges();
}

function laneFor(annotation: AnnotationInCQT): number {
  return laneById.value.get(annotation.id) ?? 0;
}

/**
For a given segment and an annotation, determine whether the labelanchor (midpoint of the annotation) is in this segment. 
This is done by comparing the midpoint with the stored start and end of the segment. 
 */
function segmentHasLabelAnchor(segment: AnnotationTextSegment<AnnotationView>, annotation: AnnotationView): boolean {
  const anchor = (annotation.start + annotation.end) / 2;
  return anchor >= segment.start && anchor < segment.end;
}

/** Given a segment and an annotation, compute the position of the label anchor (midpoint of the annotation) relative to this segment. */
function labelAnchorStyle(segment: AnnotationTextSegment<AnnotationView>, annotation: AnnotationView) {
  const anchor = (annotation.start + annotation.end) / 2;
  const segmentLength = segment.end - segment.start;
  const position = segmentLength > 0 ? ((anchor - segment.start) / segmentLength) * 100 : 50;
  return {left: `${position}%`};
}

/**  
 Simple shortning heuristic: 
 if the label fits in the selected text, use it as-is. Else, if it has multiple words, 
 use the first letter of each word. Else, truncate to the length of the selected text.
 Only the character counts are considered, not the actual pixel width. 
 */
function shortLabel(label: string, selectedText: string): string {
  const cleanLabel = label.trim() || "Term";
  const available = Math.max(1, Array.from(selectedText.trim()).length);
  if (Array.from(cleanLabel).length <= available) return cleanLabel;
  const words = cleanLabel.replace(/[()]/g, " ").split(/[\s_-]+/).filter(Boolean);
  if (words.length > 1) return words.map((part) => part[0]).join("").toUpperCase().slice(0, available);
  return Array.from(cleanLabel).slice(0, available).join("");
}

function sourceStyle(segment: AnnotationTextSegment<AnnotationView>) {
  const primary = [...segment.annotations].sort((left, right) => laneFor(left) - laneFor(right))[0];
  if (!primary) return undefined;
  const colors = getAnnotationLabelOption(primary.term.content);
  return {backgroundColor: colors.backgroundColor, color: colors.textColor};
}

function barStyle(annotation: AnnotationView) {
  const colors = getAnnotationLabelOption(annotation.term.content);
  const lane = laneFor(annotation);
  return {
    top: `${2.05 + lane * 0.82}rem`,
    backgroundColor: colors.barColor,
  };
}
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false" />

  <div class="mb-3 flex flex-wrap items-center justify-end gap-3">
    <div v-if="canEditSelected" class="flex items-center gap-2">
      <template v-if="isEditing">
        <button type="button" :disabled="saving || !hasStagedChanges" class="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50" :aria-label="$t('saveAnnotations')" :title="$t('saveAnnotations')" @click="saveChanges">
          <CheckIcon class="h-4 w-4" /> {{ $t('save') }}
        </button>
        <button type="button" :disabled="saving" class="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700" :aria-label="$t('discardChanges')" :title="$t('discardChanges')" @click="discardChanges">
          <XMarkIcon class="h-4 w-4" /> {{ $t('discard') }}
        </button>
      </template>
      <button v-else type="button" class="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700" @click="beginEditing">
        <PencilIcon class="h-4 w-4" /> {{ $t('edit') }}
      </button>
    </div>
  </div>
  <p class="mb-2 text-sm text-gray-600 dark:text-gray-300">
    <template v-if="isEditing">Select text to annotate. Changes are staged until you save or discard.</template>
    <template v-else>{{ $t('termAnnotationsForQuestion') }}</template>
  </p>
  <p v-if="selectedAnnotationVersion?.copyStatus === 'needs_annotation'" class="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
    {{ $t('annotationsMustBeRecreated') }}
  </p>

  <div ref="textContainer"
       class="annotation-text rounded-md bg-gray-50 px-3 py-3 text-gray-800 ring-1 ring-inset ring-gray-200 dark:bg-gray-800/70 dark:text-gray-100 dark:ring-gray-700"
       @mouseup="captureTextSelection">
    <template v-for="segment in displaySegments" :key="`${segment.start}-${segment.end}`">
      <span v-if="segment.annotations.length === 0 || /[\r\n]/.test(segment.text)"
            data-annotation-source="true">{{ segment.text }}</span>
      <span v-else class="annotation-chunk"
            :class="{ 'annotation-chunk--label-anchor': segment.annotations.some((annotation) => segmentHasLabelAnchor(segment, annotation)) }"
            :style="{paddingBottom: `${0.3 + (maxLane + 1) * 0.82}rem`}">
        <span data-annotation-source="true"
              class="annotation-source"
              :style="sourceStyle(segment)">{{ segment.text }}</span>
        <template v-for="annotation in segment.annotations" :key="annotation.id">
          <button v-if="isEditing"
                  type="button"
                  class="annotation-bar"
                  :style="barStyle(annotation)"
                  :title="`${$t('editAnnotation')}: ${annotation.term.content} (${$t('rightClickToRemove')})`"
                  :aria-label="`${$t('editAnnotation')}: ${annotation.term.content}`"
                  @mouseup.stop
                  @click.stop="editAnnotation(annotation)"
                  @contextmenu.prevent.stop="removeAnnotation(annotation)">
            <span v-if="segmentHasLabelAnchor(segment, annotation)"
                  class="annotation-label"
                  :style="labelAnchorStyle(segment, annotation)"
                  :title="annotation.term.content">{{ shortLabel(annotation.term.content, annotation.content) }}</span>
          </button>
          <span v-else class="annotation-bar" :style="barStyle(annotation)" aria-hidden="true">
            <span v-if="segmentHasLabelAnchor(segment, annotation)"
                  class="annotation-label"
                  :style="labelAnchorStyle(segment, annotation)"
                  :title="annotation.term.content">{{ shortLabel(annotation.term.content, annotation.content) }}</span>
          </span>
        </template>
      </span>
    </template>
  </div>

  <div v-if="pendingSelection && isEditing" class="mt-3 rounded-md border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="min-w-0 grow text-sm text-gray-700 dark:text-gray-200">
        <template v-if="editingAnnotationId">{{ $t('editAnnotation') }}:</template>
        <template v-else>{{ $t('selected') }}:</template>
        <span class="font-medium" :title="pendingSelection.content"> “{{ pendingSelection.content }}”</span>
      </p>
      <button type="button" class="rounded p-1 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Cancel annotation" @click="closeSelection">
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>

    <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
      <div class="min-w-0 grow">
        <Combobox :model-value="term" @update:model-value="selectTerm">
          <div class="relative">
            <ComboboxInput
              class="block w-full rounded-md border-0 py-1.5 pr-10 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600"
              :display-value="displayTerm"
              placeholder="Choose or create a term"
              @input="updateQuery"
              @keydown.enter.prevent="saveAnnotation" />
            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
            <TransitionRoot leave="transition ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0">
              <ComboboxOptions class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800">
                <ComboboxOption v-for="item in filteredTerms" :key="item.id" :value="item" as="template" v-slot="{active, selected}">
                  <li class="relative cursor-default select-none py-2 pl-9 pr-3"
                      :class="active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'">
                    <span :class="selected ? 'font-semibold' : 'font-normal'">{{ item.content }}</span>
                    <CheckIcon v-if="selected" class="absolute left-2 top-2 h-4 w-4" aria-hidden="true" />
                  </li>
                </ComboboxOption>
                <ComboboxOption v-if="query.trim()" :value="newTermOption" as="template" v-slot="{active}">
                  <li class="cursor-default select-none px-3 py-2"
                      :class="active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'">
                    Create term “{{ query.trim() }}”
                  </li>
                </ComboboxOption>
              </ComboboxOptions>
            </TransitionRoot>
          </div>
        </Combobox>
        <div v-if="(term?.content || query).trim().length > 0" class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input v-model="newTermDefinition" type="text" placeholder="Definition (optional)"
                 class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600" />
          <input v-model="newTermConceptIri" type="text" placeholder="Concept IRI (optional)"
                 class="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600" />
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
      <button type="button" :disabled="!term || saving"
                class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                @click="saveAnnotation">{{ editingAnnotationId ? $t('applyChanges') : $t('addAnnotation') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.annotation-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 1rem;
  line-height: 2rem;
}

.annotation-chunk {
  position: relative;
  display: inline-block;
  vertical-align: baseline;
}

.annotation-chunk--label-anchor {
  z-index: 3;
}

.annotation-source {
  position: relative;
  z-index: 1;
  border-radius: 0.15rem;
  padding-inline: 0.05rem;
}

.annotation-bar {
  position: absolute;
  z-index: 2;
  left: -1px;
  display: block;
  width: calc(100% + 2px);
  height: 0.22rem;
  transform: translateY(-50%);
  border: 0;
  border-radius: 999px;
  overflow: visible;
  padding: 0;
  appearance: none;
  cursor: pointer;
}

span.annotation-bar {
  cursor: default;
}

.annotation-label {
  position: absolute;
  top: 50%;
  left: 50%;
  width: max-content;
  transform: translate(-50%, -50%);
  color: white;
  background-color: inherit;
  border-radius: 0.15rem;
  font-size: 0.55rem;
  font-weight: 700;
  line-height: 0.75rem;
  padding-inline: 0.1rem;
  white-space: nowrap;
  pointer-events: none;
}
</style>
