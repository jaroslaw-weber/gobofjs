<template>
  <div :style="{display: visible ? 'block' : 'none'}" :size="size">
    <webcam :size="size"></webcam>
    <br>
    <tracker :size="size" :isTracking="isTracking" @toggleTracking="$emit('toggleTracking')"></tracker>
  </div>
</template>
<script>
import Webcam from "./Webcam.vue";
import Tracker from "./Tracker.vue";

export default {
  data: () => {
    return {};
  },
  props: ["isTracking", "visible", "size"],
  components: {
    webcam: Webcam,
    tracker: Tracker
  }
};
</script>