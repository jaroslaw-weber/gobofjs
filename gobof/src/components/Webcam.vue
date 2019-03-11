<template>
  <div>
    <div class="box">
      <div class="content">
        <p>your webcam</p>
      </div>
      <video
        id="webcam"
        ref="webcam"
        :width="size"
        :height="size"
        muted
        controls
        autoplay
      >Your browser does not support the video tag.</video>
    </div>
  </div>
</template>


<script>
export default {
  data: () => {
    return {};
  },
  props: ["size"]
};
</script>