<script setup lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import {ref} from "vue";


const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "" as UXResponse["messageType"],
    text: "",
    detail: "",
  },
  open: false
});

</script>

<template>
  <MessagePopup :uxresponse="messagePopupData.uxresponse"
                :open="messagePopupData.open"
                @close="messagePopupData.open = false;"/>
  <div class="w-full">
    <h1 class="text-2xl">
      {{ $t('aboutThisProject') }}
    </h1>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">{{ $t('versionHistory') }}</h2>
      <p>
        {{ $t('theCurrentVersionIs') }} <span class="font-medium text-blue-600">v0.1.0</span>{{ $t('releasedOn') }}
        <time datetime="2025-03-02">3.2.2025</time>
        {{ $t('thisVersionFixesIssuesWhereTermsCannotBeAddedAndUsersCannotBeAddedToGroupsPostHoc') }}
      </p>
    </section>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">{{ $t('reportBugs') }}</h2>
      <p>
        {{ $t('youCanReportBugsInTheFrontendTo') }} <a
          href="https://github.com/HerrMotz/Competency-Question-Manager-Frontend/issues"
          class="underline decoration-1 font-bold decoration-blue-600 hover:decoration-2">{{ $t('theFrontendRepository') }}</a>
        {{ $t('andBugsInTheBackendTo') }} <a href="https://github.com/HerrMotz/Competency-Question-Manager-Backend/issues"
                                      class="underline decoration-1 font-bold decoration-blue-600 hover:decoration-2">{{ $t('theBackendRepository') }}</a>.
      </p>
    </section>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">{{ $t('activeMaintainers') }}</h2>
      <p>
        <a href="https://www.daniel-motz.de" class="underline decoration-1 font-bold decoration-blue-600 hover:decoration-2">Daniel Motz</a><br>
        Wissenschaftlicher Mitarbeiter<br>
        <a href="mailto:daniel.motz@uni-jena.de" class="underline decoration-1 font-bold decoration-blue-600 hover:decoration-2">daniel.motz@uni-jena.de</a><br>
        <br>
        Arbeitsgruppe Künstliche Intelligenz<br>
        Professur für Praktische Informatik / Angewandte Informatik<br>
        Fakultät für Mathematik und Informatik<br>
        Friedrich-Schiller-Universität Jena<br>
        Inselplatz 5<br>
        07743 Jena
      </p>
    </section>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">{{ $t('theDevelopers') }}</h2>
      <p>
        {{ $t('thisProgramWasRealisedInCooperationWithJanMartinKeilDLRJenaBy') }}
      </p>
      <ul class="list-disc list-inside mt-2">
        <li>Dominik Buschhold (Backend)</li>
        <li>Malte Weber (Backend)</li>
        <li>Chiara Tunc (UX)</li>
        <li>Daniel Motz (Frontend)</li>
      </ul>
    </section>
  </div>

</template>

<style scoped>

</style>