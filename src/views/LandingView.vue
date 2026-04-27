<script lang="ts" setup>
import {ref} from 'vue'
import {Dialog, DialogPanel} from '@headlessui/vue'
import {
  ArrowPathIcon,
  Bars3Icon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import Logo from "../components/Logo.vue";
import AppScreenshot from "../assets/app-screenshot.png";

const navigation: { name: string; href: string }[] = [
  // {name: 'Product', href: '#'},
]

const features = [
  {
    name: 'Direct Collaboration with Domain Experts',
    description:
        'Our permission handling allows for a company wide collaboration, where everybody is in the loop, while keeping an overview over who has done what.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Term Annotation',
    description:
        'Reoccurring terms can be annotated and connected with other questions that use the same term.',
    icon: ArrowPathIcon,
  },
  // {
  //   name: 'Ontology Visualisation',
  //   description:
  //       'Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.',
  //   icon: ArrowPathIcon,
  // },
  {
    name: 'Collaboration between Ontology Engineers',
    description:
        'Using our annotation tools, versioning and rating even big projects are lucid!.',
    icon: FingerPrintIcon,
  },
]

const footerNavigation = {
  solutions: [
    {name: 'Competency Question Management', href: '#'},
    // {name: 'Synonym & Homonym Analysis', href: '#'},
    // {name: 'Graph Visualisation', href: '#'},
  ],
  support: [
    {name: 'Documentation', href: '#'},
    {name: 'API Reference', href: import.meta.env.VITE_API_URL+'/schema/swagger'},
  ],
  creators: [
    {name: 'About', href: '#'},
  ],
  legal: [
    {name: 'Claim', href: '#'},
    {name: 'Privacy', href: '#'},
    {name: 'Terms', href: '#'},
  ],
}

const mobileMenuOpen = ref(false)
</script>

<template>
  <div>
    <!-- Header -->
    <header class="absolute inset-x-0 top-0 z-50">
      <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="#" class="-m-1.5 p-1.5">
            <span class="sr-only">CQ-Manager</span>
            <Logo class="text-4xl h-12"/>
          </a>
        </div>
        <div class="flex lg:hidden">
          <button type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                  @click="mobileMenuOpen = true">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon class="h-6 w-6" aria-hidden="true"/>
          </button>
        </div>
        <div class="hidden lg:flex lg:gap-x-12">
          <a v-for="item in navigation" :key="item.name" :href="item.href"
             class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">{{ item.name }}</a>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <RouterLink to="/login" class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Log in <span
              aria-hidden="true">&rarr;</span></RouterLink>
        </div>
      </nav>
      <Dialog as="div" class="lg:hidden" @close="mobileMenuOpen = false" :open="mobileMenuOpen">
        <div class="fixed inset-0 z-50"/>
        <DialogPanel
            class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div class="flex items-center justify-between">
            <a href="#" class="-m-1.5 p-1.5">
              <span class="sr-only">Your Company</span>
              <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
            </a>
            <button type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700" @click="mobileMenuOpen = false">
              <span class="sr-only">Close menu</span>
              <XMarkIcon class="h-6 w-6" aria-hidden="true"/>
            </button>
          </div>
          <div class="mt-6 flow-root">
            <div class="-my-6 divide-y divide-gray-500/10">
              <div class="space-y-2 py-6">
                <a v-for="item in navigation" :key="item.name" :href="item.href"
                   class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">{{
                    item.name
                  }}</a>
              </div>
              <div class="py-6">
                <a href="#"
                   class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Log
                  in</a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>

    <main class="isolate">
      <!-- Hero section -->
      <div class="relative pt-14">
        <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
             aria-hidden="true">
          <div
              class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"/>
        </div>
        <div class="py-24 sm:py-32">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
              <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-gray-100">
                Manage <span class="whitespace-nowrap">Competency Questions</span> effectively
              </h1>
              <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-200">
                The CQ-Manager allows for an <span class="underline decoration-sky-500 font-bold">efficient</span> and <span class="underline decoration-sky-500 font-bold">structured</span> collaboration between ontology engineers and users.
              </p>
              <div class="mt-10 flex items-center justify-center gap-x-6">
                <a href="/login"
                   class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get
                  started</a>
                <a href="#feature-section" class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Learn more <span
                    aria-hidden="true">→</span></a>
              </div>
            </div>
            <div class="mt-16 flow-root sm:mt-24">
              <div
                  class="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <img :src="AppScreenshot" alt="App screenshot" width="2432" height="1442"
                     class="rounded-md shadow-2xl ring-1 ring-gray-900/10"/>
              </div>
            </div>
          </div>
        </div>
        <div
            class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true">
          <div
              class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"/>
        </div>
      </div>

      <!-- Feature section -->
      <div id="feature-section" class="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Focus on what's important</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">Everything you
            need to develop ontologies in big teams</p>
          <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Staying on top of different end users wishes can be a challenging task. We've got something for you!
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div v-for="feature in features" :key="feature.name" class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <component :is="feature.icon" class="h-6 w-6 text-white" aria-hidden="true"/>
                </div>
                {{ feature.name }}
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">{{ feature.description }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <div class="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
      <footer aria-labelledby="footer-heading" class="relative border-t border-gray-900/10 py-24 sm:mt-56 sm:py-32">
        <h2 id="footer-heading" class="sr-only">Footer</h2>
        <div class="xl:grid xl:grid-cols-3 xl:gap-8">
          <Logo class="text-3xl h-10"/>
          <div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div class="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Solutions</h3>
                <ul role="list" class="mt-6 space-y-4">
                  <li v-for="item in footerNavigation.solutions" :key="item.name">
                    <a :href="item.href"
                       class="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:dark:text-gray-100">{{
                        item.name
                      }}</a>
                  </li>
                </ul>
              </div>
              <div class="mt-10 md:mt-0">
                <h3 class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Support</h3>
                <ul role="list" class="mt-6 space-y-4">
                  <li v-for="item in footerNavigation.support" :key="item.name">
                    <a :href="item.href"
                       class="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:dark:text-gray-100">{{
                        item.name
                      }}</a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 class="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Creators</h3>
                <ul role="list" class="mt-6 space-y-4">
                  <li v-for="item in footerNavigation.creators" :key="item.name">
                    <a :href="item.href"
                       class="text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 hover:dark:text-gray-100">{{
                        item.name
                      }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>

</style>