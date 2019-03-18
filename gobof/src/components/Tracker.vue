<template>
  <div>
    <div class="box">
      <div class="content">
        <p>tracking</p>
      </div>
      <canvas id="canvasOutput" 
    :style="{display: config.showTracker ? 'block' : 'none'}" :width="size" :height="size" muted></canvas>
    </div>

    <div class="control">
      <button id="trackerbutton" class="button is-primary" @click="$emit('toggleTracking')">{{buttonText}}</button>
      <br>
      <br>
      <p>you may need to restart tracker after changing settings</p>
    </div>
  </div>
</template>


<script>
export default {
  data: () => {
    return {
      //display fps
      fpscolor: "gray",
      //real fps rigth now
      fpscounter: 0
    };
  },
  props: ["size", "isTracking", "config"],
  computed: {
    buttonText: function() {
      if (this.isTracking) return "stop";
      return "start";
    }
  }
};
</script>

<style>
</style>