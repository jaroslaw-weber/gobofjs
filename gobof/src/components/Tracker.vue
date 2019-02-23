<template>
  <div>
    <div class="box">
      <div class="content">
        <p>tracking</p>
      </div>
      <canvas id="canvasOutput" v-bind:width="width" v-bind:height="height" muted></canvas>
    </div>

    <div class="control">
      <button
        class="button is-primary"
        v-on:click="toggleTracking()"
        :disabled="!wasmloaded"
      >{{trackingButton}}</button>
      <button
        class="button is-primary"
        v-on:click="toggleTracking()"
        :disabled="!wasmloaded"
      >apply changes</button>
    </div>
    <div class="column" v-if="fpscounter>1">
      <div>
        <p v-bind:style="{color:fpscolor}">fps: {{fpscounter}}</p>
      </div>
    </div>
  </div>
</template>


<script>
module.exports = {
  data: function() {},
  props: ["width", "height"]
};
</script>

<style>

</style>