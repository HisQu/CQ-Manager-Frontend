<script setup lang="ts">

import LanguageSelector from "./components/LanguageSelector.vue";
import Navbar from "./components/Navbar.vue";

import { useStore } from "./store.ts";
import { storeToRefs } from 'pinia'
import {computed, provide, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {cqCommentsPaneKey, useCqCommentsDocking, useCqCommentsCoexistence} from "./composables/cqCommentsPane";
const store = useStore()
const { isLoggedIn, sidebarCollapsed } = storeToRefs(store)

const route = useRoute();

const commentsPaneDocked = useCqCommentsDocking();
const canExpandBothPanes = useCqCommentsCoexistence();
const commentsPaneExpanded = ref(commentsPaneDocked.value);
provide(cqCommentsPaneKey, {expanded: commentsPaneExpanded, docked: commentsPaneDocked});
watch([() => route.fullPath, commentsPaneDocked], () => {
  commentsPaneExpanded.value = commentsPaneDocked.value;
});
const hasCommentsPane = computed(() => isLoggedIn.value && route.name === 'question-detail');
const commentsPaneOpen = computed(() => hasCommentsPane.value && commentsPaneDocked.value && commentsPaneExpanded.value);
const forceNavbarCollapsed = computed(() => commentsPaneOpen.value && !canExpandBothPanes.value);
const navbarCollapsed = computed(() => sidebarCollapsed.value || forceNavbarCollapsed.value);

// Views kept alive while other pages are visited, so returning to them is instant and keeps their scroll position.
// Emptied on logout, which drops the cached views and their data.
const keptAliveViews = computed(() => isLoggedIn.value ? ['CompetencyQuestionDashboardView'] : []);

function expandNavbar() {
  if (!canExpandBothPanes.value) commentsPaneExpanded.value = false;
}

const showNavbar = computed(() =>  {
  return isLoggedIn.value && route.path !== '/' && route.path !== '/login'
})

</script>

<template>
  <div class="min-h-screen">
    <Navbar v-if="showNavbar" :force-collapsed="forceNavbarCollapsed" @expand="expandNavbar"/>

    <main class="pb-10 pt-7 min-h-screen dark:bg-gray-800 dark:text-gray-100"
          :class="[showNavbar ? (navbarCollapsed ? 'sm:pl-16' : 'sm:pl-72') : '', hasCommentsPane && commentsPaneDocked ? (commentsPaneOpen ? 'pr-96' : 'pr-12') : '']">
      <div class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div v-if="route.path !== '/'" class="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        <RouterView v-slot="{ Component, route: viewRoute }">
          <template v-if="Component">
            <KeepAlive :include="keptAliveViews">
              <Suspense>
                <component :is="Component" :key="viewRoute.fullPath" />
              </Suspense>
            </KeepAlive>
          </template>
        </RouterView>
      </div>
    </main>
  </div>

</template>

<style scoped>

</style>
