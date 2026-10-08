<script lang="ts">
import {defineComponent} from 'vue'
import {PlusIcon, CheckIcon} from "@heroicons/vue/20/solid";
import {ArrowDownOnSquareIcon, QuestionMarkCircleIcon} from "@heroicons/vue/24/solid";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";
import {ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon} from "@heroicons/vue/24/outline";

export default defineComponent({
  name: "SubmitButtonWithCallback",
  components: {XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, Dialog, DialogTitle, DialogPanel, TransitionChild, TransitionRoot, ArrowDownOnSquareIcon, PlusIcon, CheckIcon, QuestionMarkCircleIcon},
  emits: ['savebutton', 'modalsuccessclose'],
  props: {
    title: String,
    detail: String,
    goBackButtonText: String,
    agreeButtonText: String,
    open: Boolean
  },
  watch: {
    open(newV, _) {
      this.localOpen = newV;
    }
  },
  data() {
    return {
      localOpen: false
    }
  }
})
</script>

<template>
  <TransitionRoot as="template" :show="localOpen">
    <Dialog class="relative z-10" @close="localOpen = false">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <QuestionMarkCircleIcon class="h-6 w-6 text-yellow-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    {{ title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {{ detail }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-if="goBackButtonText" class="mt-5 sm:mt-6">
                <button type="button"
                        class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        @click="localOpen = false; $emit('modalsuccessclose')">
                  {{ goBackButtonText }}
                </button>
              </div>
              <div v-else class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button type="button"
                        class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                        @click="localOpen = false; $emit('modalsuccessclose')">
                  {{agreeButtonText}}
                </button>
                <button type="button"
                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        @click="localOpen = false" ref="cancelButtonRef">
                  {{ $t('cancel') }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <button type="button"
          @click="localOpen = true"
          class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
    <slot></slot>
  </button>
</template>

<style scoped>

</style>