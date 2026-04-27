<script lang="ts">
import {defineComponent} from 'vue'
import {StarIcon} from "@heroicons/vue/24/solid";
import RatingDataService from "../services/RatingDataService.ts";
import MessagePopup from "./MessagePopup.vue";

export default defineComponent({
  name: "StarComponent",
  components: {MessagePopup, StarIcon},
  props: {
    rating: {
      type: Number,
      required: true
    },
    question_id: {
      type: String,
      required: false
    },
    version: {
      type: Number,
      required: false,
      default: 1
    },
    ignore_zero_rating: {
      type: Boolean,
      required: false
    }
  },

  emits: ['afterRating'],

  data() {
    return {
      messagePopupData: {
        uxresponse: {
          title: "",
          messageType: "" as UXResponse["messageType"],
          text: "",
          detail: "",
        },
        open: false
      }
    }
  },

  computed: {
    isNotClickable() {
      return typeof this.question_id === "undefined"
    }
  },

  methods: {
    async rateWrapper(stars: number) {
      // if not all information was passed, this cannot be run.
      if (this.isNotClickable) {
        return // atm, do not throw an error
      }

      console.log("rate: " + stars)

      // the undefined is checked with this.isNotClickable above.
      // noinspection TypeScriptValidateTypes
      const response = await RatingDataService.rate(stars, this.question_id!, this.version)

      if ("messageType" in response) {
        this.messagePopupData.uxresponse = {
          ...this.messagePopupData.uxresponse,
          ...response
        };
        this.messagePopupData.open = true;

      } else {
        // TODO do something else
        //  a popup is not wished

        // this.messagePopupData.uxresponse = {
        //   title: "Rating successful",
        //   messageType: "success",
        //   text: "Your rating was submitted successfully!",
        //   detail: ""
        // };
        // this.messagePopupData.open = true;
        console.log(response.data)
        this.$emit('afterRating');
      }
    }
  }
})
</script>

<template>
  <div v-if="rating === 0 && isNotClickable && !ignore_zero_rating">
    No rating.
  </div>
  <div v-else>
    <MessagePopup :uxresponse="messagePopupData.uxresponse"
                  :open="messagePopupData.open"
                  @close="messagePopupData.open = false;"/>
    <div>
      <StarIcon v-for="i in rating"
                :class="['h-5 w-5 text-yellow-500 inline', !isNotClickable ? 'hover:text-yellow-400 cursor-pointer' : '']"
                aria-hidden="true"
                @click="rateWrapper(i)"/>
      <StarIcon v-for="i in (5 - rating)"
                :class="['h-5 w-5 text-gray-500 inline', !isNotClickable ? 'hover:text-gray-400 cursor-pointer' : '']"
                aria-hidden="true"
                @click="rateWrapper(i+rating)"/>
    </div>
  </div>
</template>

<style scoped>

</style>