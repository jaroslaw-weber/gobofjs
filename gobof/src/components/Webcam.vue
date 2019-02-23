<template>
  <div>
    <div class="box">
      <div class="content">
        <p>your webcam</p>
      </div>
      <video
        id="webcam"
        v-bind:width="width"
        v-bind:height="height"
        autoplay
        muted
      >Your browser does not support the video tag.</video>
    </div>

    <div class="control">
      <button class="button is-primary" onclick="loadwebcam()">load webcam</button>
    </div>
  </div>
</template>


<script>
module.exports = {
  data: function() {},
  props: ["width", "height"]
};
</script>