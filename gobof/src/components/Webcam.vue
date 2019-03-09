<template>
  <div>
    <div class="box">
      <div class="content">
        <p>your webcam</p>
      </div>
      <cam id="webcam" :width="size" :height="size" :muted="false">Your browser does not support the video tag.</cam>
    </div>
  </div>
</template>


<script>
import Camera from "vue-web-cam";

export default {
  data: () => {
    return {};
  },
  props: ["size"],
  components: { cam: Camera.WebCam }
};
</script>