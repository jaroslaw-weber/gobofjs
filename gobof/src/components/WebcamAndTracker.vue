<template>
  <div :style="{display: visible ? 'block' : 'none'}" :size="size">
    <webcam :size="size" :style="{display: config.showWebcam ? 'block' : 'none'}"></webcam>
    <br>
    <tracker :size="size" :isTracking="isTracking" :config="config"
    @toggleTracking="$emit('toggleTracking')"></tracker>
  </div>
</template>
<script>
import Webcam from "./Webcam.vue";
import Tracker from "./Tracker.vue";

export default {
  data: () => {
    return {};
  },
  props: ["isTracking", "visible", "size", "config"],
  components: {
    webcam: Webcam,
    tracker: Tracker
  }
};
</script>