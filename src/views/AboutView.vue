<script setup lang="ts">
import MessagePopup from "../components/MessagePopup.vue";
import {ref} from "vue";


const messagePopupData = ref({
  uxresponse: {
    title: "",
    messageType: "",
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
      About this Project
    </h1>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">Version History</h2>
      <p>
        The current version is <span class="font-medium text-blue-600">v0.1.0</span>, released on
        <time datetime="2025-03-02">3.2.2025</time>
        . This version fixes issues where terms cannot be added and users cannot be added to groups post-hoc.
      </p>
    </section>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">Report bugs</h2>
      <p>
        You can report bugs in the frontend to <a
          href="https://github.com/HerrMotz/Competency-Question-Manager-Frontend/issues"
          class="underline decoration-1 font-bold decoration-blue-600 hover:decoration-2">the frontend repository</a>
        and bugs in the backend to <a href="https://github.com/HerrMotz/Competency-Question-Manager-Backend/issues"
                                      class="underline decoration-1 font-bold decoration-blue-600 hover:decoration-2">the backend
        repository</a>.
      </p>
    </section>

    <section class="max-w-2xl my-12 leading-relaxed">
      <h2 class="text-3xl font-extrabold mb-4">Active maintainers</h2>
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
      <h2 class="text-3xl font-extrabold mb-4">The Developers</h2>
      <p>
        This program was realised in cooperation with Jan Martin Keil (DLR Jena) by:
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