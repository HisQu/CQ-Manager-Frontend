<script setup lang="ts">
import { t } from '../i18n'

import MessagePopup from "../components/MessagePopup.vue";
import DetailPageHeader from "../components/DetailPageHeader.vue";
import {computed, ref, watch} from "vue";
import {useStore} from "../store.ts";
import {storeToRefs} from "pinia";
import TermDataService from "../services/TermDataService.ts";
import TermListItem from "../components/TermListItem.vue";
import SearchInput from "../components/SearchInput.vue";
import {matchesSearch} from "../utils/cqFilters.ts";

const useStore1 = useStore()
const {getProject} = storeToRefs(useStore1)

const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false
})

const terms = ref();
const searchQuery = ref("");

const displayedTerms = computed<TermT[]>(() => [...(terms.value?.data ?? [])]
  .filter((term: TermT) => matchesSearch([term.content, term.definition, term.conceptIri], searchQuery.value))
  .sort((a: TermT, b: TermT) => a.content.localeCompare(b.content)));

async function fetchTerms() {

  if (!getProject.value.id) {
    messagePopupData.value.uxresponse = {
      title: t('noProjectSelected'),
      messageType: "warning",
      text: t('pleaseSelectAProjectInTheNavigationBarOnTheLeftFirst'),
      detail: ""
    };
    messagePopupData.value.open = true;
  } else {
    TermDataService.getAllForOneProject(getProject.value.id).then(response => {
      if ("messageType" in response) {
        messagePopupData.value.uxresponse = {
          ...messagePopupData.value.uxresponse,
          ...response
        };
        messagePopupData.value.open = true;

      } else {
        terms.value = response;
      }
    });
  }
}

fetchTerms()

watch(getProject, (_, __) => {
  fetchTerms()
})
</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="w-full">
    <DetailPageHeader :title="$t('glossary')" :project="getProject.name">
      <template #meta>
        <span class="text-gray-500 dark:text-gray-400">{{ $t('newTermsCanBeAddedViaACompetencyQuestionDetailView') }}</span>
      </template>
    </DetailPageHeader>

    <div v-if="terms">
      <SearchInput class="mt-5 max-w-xl" v-model="searchQuery" :placeholder="$t('searchTerms')" />

      <div v-if="displayedTerms.length === 0" class="mt-10 text-sm text-gray-500 dark:text-gray-400">
        {{ terms.data.length ? $t('noTermsMatchYourSearch') : $t('thereAreNoTermsYet') }}
      </div>

      <TermListItem v-for="term in displayedTerms" :key="term.id" :term="term"/>

    </div>
    <div v-else>
      <div v-for="_ in 4" :key="_"
           class="border-1 shadow rounded-lg p-4 max-w-xl w-full dark:bg-gray-700 dark:text-gray-200 bg-gray-100 mt-4">
        <div class="animate-pulse flex space-x-4">
          <div class="flex-1 space-y-6 py-1">
            <div class="h-2 bg-slate-500 rounded"></div>
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-2 bg-slate-500 rounded col-span-2"></div>
                <div class="h-2 bg-slate-500 rounded col-span-1"></div>
              </div>
              <div class="h-2 bg-slate-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>