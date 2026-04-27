<script lang="ts">
import {defineComponent} from 'vue'
import {useStore} from "../store.ts";

import {
  Dialog, DialogPanel, TransitionChild, TransitionRoot
} from '@headlessui/vue'

import {
  Bars3Icon,
  ChartPieIcon,
  FolderIcon,
  UsersIcon,
  XMarkIcon,
  ListBulletIcon,
  QueueListIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'
import Logo from "./Logo.vue";
import {ArrowsPointingInIcon} from "@heroicons/vue/20/solid";
import ProjectDataService from "../services/ProjectDataService.ts";

export default defineComponent({
  name: "Navbar",

  components: {
    Logo,
    Dialog,
    DialogPanel,
    Bars3Icon,
    ChartPieIcon,
    XMarkIcon,
    ListBulletIcon,
    TransitionChild,
    TransitionRoot,
    QueueListIcon
  },

  computed: {
    currentRouteName() {
      return this.$route.path;
    },
    currentProject() {
      console.log("current project")
      console.log(this.store.project)
      return this.store.project
    }
  },

  data() {
    return {
      sidebarOpen: false,

      store: useStore(),

      projects: [
      ],

      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "",
          text: "",
          detail: "",
        },
        open: false
      },

      navigation: [
        { name: 'About / Bugs', href: '/about', icon: QuestionMarkCircleIcon },
        { name: 'Competency Questions', href: '/questions', icon: ListBulletIcon },
        { name: 'Consolidation', href: '/consolidations', icon: ArrowsPointingInIcon },
        { name: 'Group', href: '/groups', icon: UsersIcon },
        { name: 'Terms', href: '/terms', icon: QueueListIcon },
        { name: 'Reports', href: '/reports', icon: ChartPieIcon },
      ],
    }
  },

  methods: {
    isDeepEqual(obj1: object, obj2: object) {
      // Check the object types
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return obj1 === obj2;
      }

      // Compare if they are the same reference
      if (obj1 === obj2) {
        return true;
      }

      // Compare keys length
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      // Recursively compare each key in the object
      for (let key of keys1) {
        if (!keys2.includes(key)) {
          return false;
        }
        if (!this.isDeepEqual(obj1[key], obj2[key])) {
          return false;
        }
      }

      return true;
    }
  },

  mounted() {
    ProjectDataService.getAll().then(response => {
      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        this.projects = response.data;
        console.log()
        console.log(this.projects)
      }
    });

    if (this.store.getUser.isSystemAdmin) {
      this.navigation.push({ name: 'Projects (SysAdmin)', href: '/projects', icon: FolderIcon })
      this.navigation.push({ name: 'Users (SysAdmin)', href: '/users', icon: UsersIcon })
    }

  },
})
</script>

<template>
  <TransitionRoot as="template" :show="sidebarOpen">
    <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
      <TransitionChild as="template" enter="transition-opacity ease-linear duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="transition-opacity ease-linear duration-300" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-900/80" />
      </TransitionChild>

      <div class="fixed inset-0 flex">
        <TransitionChild as="template" enter="transition ease-in-out duration-300 transform" enter-from="-translate-x-full" enter-to="translate-x-0" leave="transition ease-in-out duration-300 transform" leave-from="translate-x-0" leave-to="-translate-x-full">
          <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
            <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
              <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                  <span class="sr-only">Close sidebar</span>
                  <XMarkIcon class="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
            </TransitionChild>
            <!-- Sidebar component, swap this element with another sidebar if you like -->
            <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-2">
              <div class="flex h-16 shrink-0 items-center">
                <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=white" alt="Your Company" />
              </div>
              <nav class="flex flex-1 flex-col">
                <ul role="list" class="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" class="-mx-2 space-y-1">
                      <li v-for="item in navigation" :key="item.name">
                        <RouterLink :to="item.href" :class="[currentRouteName.startsWith(item.href) ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                          <component :is="item.icon" :class="[currentRouteName.startsWith(item.href) ? 'text-white' : 'text-indigo-200 group-hover:text-white', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                          {{ item.name }}
                        </RouterLink>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <div class="text-xs font-semibold leading-6 text-indigo-200">Your projects</div>
                    <ul role="list" class="-mx-2 mt-2 space-y-1">
                      <li v-for="project in projects" :key="project.name" @click="store.project = project">
                        <button class="w-full" :class="[isDeepEqual(currentProject, project) ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white">{{ project.name.charAt(0) }}</span>
                          <span class="truncate">{{ project.name }}</span>
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>

  <!-- Static sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6">
      <div class="flex h-16 shrink-0 items-center">
        <span class="text-2xl font-bold text-white mt-5">
          <Logo/>
        </span>
      </div>

      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <li v-for="item in navigation" :key="item.name">
                <RouterLink :to="item.href" :class="[currentRouteName.startsWith(item.href) ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                  <component :is="item.icon" :class="[currentRouteName.startsWith(item.href) ? 'text-white' : 'text-indigo-200 group-hover:text-white', 'h-6 w-6 shrink-0']" aria-hidden="true" />
                  {{ item.name }}
                </RouterLink>
              </li>
            </ul>
          </li>
          <li>
            <div class="text-xs font-semibold leading-6 text-indigo-200">Your projects</div>
            <ul role="list" class="-mx-2 mt-2 space-y-1">
              <li v-for="project in projects" :key="project.name" @click="store.project = project">
                <button class="w-full" :class="[isDeepEqual(currentProject, project) ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold']">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 text-[0.625rem] font-medium text-white">{{ project.name.charAt(0) }}</span>
                  <span class="truncate">{{ project.name }}</span>
                </button>
              </li>
            </ul>
          </li>
          <li class="-mx-6 mt-auto">
            <button @click="store.logout(); $router.push('/login');" class="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700 w-full">
              <img class="h-8 w-8 rounded-full bg-indigo-700" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
              <span class="sr-only">Your profile</span>
              <span aria-hidden="true">{{ store.getUser.name }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <div class="sticky top-0 z-40 flex items-center gap-x-6 bg-indigo-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
    <button type="button" class="-m-2.5 p-2.5 text-indigo-200 lg:hidden" @click="sidebarOpen = true">
      <span class="sr-only">Open sidebar</span>
      <Bars3Icon class="h-6 w-6" aria-hidden="true" />
    </button>
    <div class="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
    <div>
      <span class="sr-only">Your profile</span>
      <img class="h-8 w-8 rounded-full bg-indigo-700" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
    </div>
  </div>
</template>

<style scoped>

</style>