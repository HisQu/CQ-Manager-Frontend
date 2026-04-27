<script lang="ts">
import {defineComponent, PropType} from 'vue'

import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from '@headlessui/vue'
import {CheckIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon} from '@heroicons/vue/24/outline'

export default defineComponent({
  name: "MessagePopup",

  components: {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
  },

  props: {
    open: {
      type: Boolean,
      required: true
    },
    uxresponse : {
      type: Object as PropType<UXResponse>,
      required: true
    }
  },

  emits: ["close"],
})

</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="$emit('close')">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                     :class="[
                       uxresponse.messageType === 'success' ? 'bg-green-100 text-green-600' : '',
                       uxresponse.messageType === 'warning' ? 'bg-orange-100 text-orange-600' : '',
                       uxresponse.messageType === 'error' ? 'bg-red-100 text-red-600' : '',
                       uxresponse.messageType === 'notice' ? 'bg-gray-100 text-gray-600' : '',
                     ]"
                >
                  <CheckIcon v-if="uxresponse.messageType === 'success'" class="h-6 w-6" aria-hidden="true"/>
                  <ExclamationTriangleIcon v-if="uxresponse.messageType === 'warning'" class="h-6 w-6"
                                           aria-hidden="true"/>
                  <XMarkIcon v-if="uxresponse.messageType === 'error'" class="h-6 w-6" aria-hidden="true"/>
                  <InformationCircleIcon v-if="uxresponse.messageType === 'notice'" class="h-6 w-6" aria-hidden="true"/>
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">
                    {{ uxresponse.title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600">
                      {{ uxresponse.text }}
                    </p>
                    <br>
                    <pre class="text-sm text-gray-500 overflow-auto">
                      {{ (uxresponse?.detail as any)?.response?.data }}
                    </pre>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button type="button"
                        class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        @click="$emit('close')">Go back
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>

</style>