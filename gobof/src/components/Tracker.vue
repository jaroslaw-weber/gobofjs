<template>
  <div>
    <div class="box">
      <div class="content">
        <p>tracking</p>
      </div>
      <canvas id="canvasOutput" :width="size" :height="size" muted></canvas>
    </div>

    <div class="control">
      <button class="button is-primary" @click="$emit('toggleTracking')">{{buttonText}}</button>
      <br>
      <br>
      <p>you may need to restart tracker after changing settings</p>
    </div>
    <div class="column" v-if="fpscounter>1">
      <div>
        <p v-bind:style="{color:fpscolor}">fps: {{fpscounter}}</p>
      </div>
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
  props: ["size", "isTracking"],
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