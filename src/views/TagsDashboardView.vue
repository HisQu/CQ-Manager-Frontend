<script setup lang="ts">
import { t } from '../i18n'

import TagDataService from "../services/TagDataService.ts";
import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import TagBadge from "../components/TagBadge.vue";
import SubmitButtonWithCallback from "../components/SubmitButtonWithCallback.vue";
import {PencilSquareIcon, PlusIcon, TrashIcon} from "@heroicons/vue/20/solid";
import {computed, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";
import {normalizeTagName, TAG_NAME_MAX_LENGTH} from "../utils/tagColors.ts";

const useStore1 = useStore();
const {getProject, getUser} = storeToRefs(useStore1);
const router = useRouter();

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false,
});

const tags = ref<TagT[] | null>(null);
// Everybody in the project may create tags; renaming and deleting is up to managers and ontology engineers.
const canCurate = ref(false);
const newTagName = ref("");
const editingTagId = ref<string | null>(null);
const editingName = ref("");

const canCreate = computed(() => normalizeTagName(newTagName.value).length > 0);

function showError(response: UXResponse) {
  messagePopupData.value.uxresponse = {...messagePopupData.value.uxresponse, ...response};
  messagePopupData.value.open = true;
}

async function fetchTags() {
  if (!getProject.value.id) {
    showError({
      title: t('noProjectSelected'),
      messageType: "warning",
      text: t('pleaseSelectAProjectInTheNavigationBarOnTheLeftFirst'),
      detail: "",
    });
    return;
  }
  const response = await TagDataService.getAllForProject(getProject.value.id);
  if ("messageType" in response) {
    showError(response);
  } else {
    const permissions = response.data as any;
    canCurate.value = getUser.value.isSystemAdmin
      || permissions.permissionsProjectManager
      || permissions.permissionsProjectEngineer;
    tags.value = [...response.data];
  }
}

async function createTag() {
  if (!canCreate.value) return;
  const response = await TagDataService.add(getProject.value.id, normalizeTagName(newTagName.value));
  if ("messageType" in response) {
    showError(response);
  } else {
    newTagName.value = "";
    await fetchTags();
  }
}

function startEditing(tag: TagT) {
  editingTagId.value = tag.id;
  editingName.value = tag.name;
}

async function saveRename(tag: TagT) {
  const name = normalizeTagName(editingName.value);
  editingTagId.value = null;
  if (!name || name === tag.name) return;
  const response = await TagDataService.rename(getProject.value.id, tag.id, name);
  if ("messageType" in response) {
    showError(response);
  } else {
    await fetchTags();
  }
}

async function deleteTag(tag: TagT) {
  const response = await TagDataService.delete(getProject.value.id, tag.id);
  if ("messageType" in response) {
    showError(response);
  } else {
    await fetchTags();
  }
}

function showTaggedCqs(tag: TagT) {
  useStore1.cqFilters = {...useStore1.cqFilters, tag: [tag.id]};
  useStore1.cqFiltersOpen = true;
  router.push("/questions");
}

fetchTags();

watch(getProject, () => fetchTags());
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;" />
  <div class="w-full">
    <DetailPageHeader :title="$t('tags')" :project="getProject.name" />

    <form class="mt-6 flex max-w-xl items-center gap-2" @submit.prevent="createTag">
      <label for="new_tag" class="sr-only">{{ $t('newTag') }}</label>
      <input id="new_tag"
             v-model="newTagName"
             type="text"
             :maxlength="TAG_NAME_MAX_LENGTH"
             :placeholder="$t('newTagName')"
             class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
      <button type="submit"
              :disabled="!canCreate"
              class="inline-flex flex-shrink-0 items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ $t('add') }}
        <PlusIcon class="-mr-0.5 h-5 w-5" aria-hidden="true" />
      </button>
    </form>

    <div v-if="tags">
      <div v-if="tags.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('thereAreNoTagsYetCreateOneAboveOrDirectlyOnACompetencyQuestion') }}
      </div>
      <ul v-else class="mt-6 max-w-3xl divide-y divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        <li v-for="tag in tags" :key="tag.id" class="flex items-center gap-3 px-4 py-3">
          <form v-if="editingTagId === tag.id" class="flex flex-1 items-center gap-2" @submit.prevent="saveRename(tag)">
            <input v-model="editingName"
                   type="text"
                   :maxlength="TAG_NAME_MAX_LENGTH"
                   :aria-label="`New name for tag ${tag.name}`"
                   class="block w-full max-w-xs rounded-md border-0 py-1 text-gray-900 dark:text-gray-100 dark:bg-gray-800 dark:ring-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                   @keydown.esc="editingTagId = null" />
            <button type="submit" class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">{{ $t('save') }}</button>
            <button type="button" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700" @click="editingTagId = null">{{ $t('cancel') }}</button>
          </form>
          <template v-else>
            <TagBadge :name="tag.name" />
            <button type="button"
                    class="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:hover:text-gray-500 disabled:cursor-default"
                    :disabled="tag.noQuestions === 0"
                    :title="tag.noQuestions ? $t('showTaggedCQs') : undefined"
                    @click="showTaggedCqs(tag)">
              {{ $t('cqCount', tag.noQuestions) }}
            </button>
            <div v-if="canCurate" class="ml-auto flex items-center gap-2">
              <button type="button"
                      class="inline-flex items-center gap-x-1 rounded-md px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      @click="startEditing(tag)">
                <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
                {{ $t('rename') }}
              </button>
              <SubmitButtonWithCallback :agree-button-text="$t('deleteTag')"
                                        :title="`Delete the tag #${tag.name}?`"
                                        :detail="$t('tagRemovalDetail', tag.noQuestions)"
                                        @modalsuccessclose="deleteTag(tag)">
                <TrashIcon class="h-4 w-4" aria-hidden="true" />
                {{ $t('delete') }}
              </SubmitButtonWithCallback>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
