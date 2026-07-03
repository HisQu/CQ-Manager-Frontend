<script setup lang="ts">
import {computed} from "vue";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";
import {ArrowDownTrayIcon} from "@heroicons/vue/20/solid";
import {useStore} from "../store.ts";

const store = useStore();

const props = defineProps<{
  open: boolean;
  cqs: CompetencyQuestionReducedT[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

type FieldKey = "question" | "type" | "rating" | "group" | "topic" | "cqCatalogueIdentifier" | "author" | "comment" | "reference" | "anchor" | "exampleAnswer" | "id";

const fieldDescriptors: { key: FieldKey; label: string; accessor: (cq: CompetencyQuestionReducedT) => string }[] = [
  {key: "question", label: "Question", accessor: cq => cq.question ?? ""},
  {key: "type", label: "Type", accessor: cq => cq.type ?? ""},
  {key: "rating", label: "Rating", accessor: cq => cq.rating != null ? String(cq.rating) : ""},
  {key: "group", label: "Group", accessor: cq => cq.group?.name ?? ""},
  {key: "topic", label: "Catalogue", accessor: cq => [cq.topic?.identifier, cq.topic?.name].filter(Boolean).join(" ")},
  {key: "cqCatalogueIdentifier", label: "Catalogue identifier", accessor: cq => cq.cqCatalogueIdentifier ?? ""},
  {key: "author", label: "Author", accessor: cq => cq.author?.name ?? cq.creator ?? ""},
  {key: "comment", label: "Comment", accessor: cq => cq.comment ?? ""},
  {key: "reference", label: "Reference", accessor: cq => cq.reference ?? ""},
  {key: "anchor", label: "Anchor", accessor: cq => cq.anchor ?? ""},
  {key: "exampleAnswer", label: "Example answer", accessor: cq => cq.exampleAnswer ?? ""},
  {key: "id", label: "ID", accessor: cq => cq.id ?? ""},
];

const validFieldKeys = new Set(fieldDescriptors.map(d => d.key));
if (!store.cqExportFields.some(key => validFieldKeys.has(key as FieldKey))) {
  store.cqExportFields = ["question", "type", "group", "comment", "reference", "exampleAnswer"];
}

const selectedFields = computed<FieldKey[]>({
  get: () => store.cqExportFields as FieldKey[],
  set: (val) => { store.cqExportFields = val; },
});

const format = computed<"markdown" | "csv">({
  get: () => store.cqExportFormat,
  set: (val) => { store.cqExportFormat = val; },
});

const activeDescriptors = computed(() =>
  fieldDescriptors.filter(d => selectedFields.value.includes(d.key))
);

function buildMarkdown(): string {
  const descriptors = activeDescriptors.value;
  const lines: string[] = [];
  for (const cq of props.cqs) {
    const questionDescriptor = descriptors.find(d => d.key === "question");
    lines.push(`### ${(questionDescriptor ? questionDescriptor.accessor(cq) : cq.question) || "(untitled)"}`);
    for (const d of descriptors) {
      if (d.key === "question") continue;
      const value = d.accessor(cq).trim();
      if (!value) continue;
      lines.push(`**${d.label}:** ${value.replace(/\r?\n/g, " ")}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(): string {
  const descriptors = activeDescriptors.value;
  const lines: string[] = [];
  lines.push(descriptors.map(d => escapeCsvCell(d.label)).join(","));
  for (const cq of props.cqs) {
    lines.push(descriptors.map(d => escapeCsvCell(d.accessor(cq))).join(","));
  }
  return lines.join("\n") + "\n";
}

function download() {
  const content = format.value === "markdown" ? buildMarkdown() : buildCsv();
  const extension = format.value === "markdown" ? "md" : "csv";
  const mimeType = format.value === "markdown" ? "text/markdown" : "text/csv";
  const blob = new Blob([content], {type: `${mimeType};charset=utf-8`});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `competency-questions.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  emit("close");
}
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-10" @close="emit('close')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                       leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300"
                           enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                           enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                           leave-from="opacity-100 translate-y-0 sm:scale-100"
                           leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
                class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Export {{ cqs.length }} competency question{{ cqs.length !== 1 ? "s" : "" }}
              </DialogTitle>

              <div class="mt-4">
                <span class="block text-sm font-medium text-gray-900 dark:text-gray-200">Format</span>
                <div class="mt-2 flex gap-4">
                  <label class="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-200">
                    <input type="radio" value="markdown" v-model="format"
                           class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    Markdown
                  </label>
                  <label class="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-200">
                    <input type="radio" value="csv" v-model="format"
                           class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    CSV
                  </label>
                </div>
              </div>

              <div class="mt-4">
                <span class="block text-sm font-medium text-gray-900 dark:text-gray-200">Fields</span>
                <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  <label v-for="d in fieldDescriptors" :key="d.key"
                         class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" :value="d.key" v-model="selectedFields"
                           class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    {{ d.label }}
                  </label>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 flex gap-3">
                <button type="button"
                        class="inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        @click="emit('close')">
                  Cancel
                </button>
                <button type="button"
                        :disabled="selectedFields.length === 0"
                        class="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="download">
                  Download
                  <ArrowDownTrayIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
