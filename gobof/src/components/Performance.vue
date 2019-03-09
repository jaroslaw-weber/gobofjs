<template>
  <div>
    <div class="field">
      <label class="label">resolution</label>
      <p class="help">{{size}} x {{size}}</p>
      <div class="control">
        <input
          class="slider has-output"
          step="1"
          min="50"
          max="1000"
          type="range"
          :value="size"
          @input="$emit('sizeChange', $event.target.value)"
        >
        <output>{{size}}</output>
      </div>
    </div>

    <slider
      :value="fps"
      @input="$emit('fpsChange', $event)"
      label="fps"
      help="be careful not to set it too high or too low. adjust depending on the performance"
      step="1"
      min="30"
      max="120"
    ></slider>

    <slider
      :value="blurStrength"
      @input="$emit('blurStrengthChange', $event)"
      label="blur strength"
      help="jittery? try blurring the image"
      step="1"
      min="3"
      max="55"
    ></slider>

    <slider
      :value="erodeDilateStrength"
      @input="$emit('erodeDilateStrengthChange', $event)"
      label="erode/dilate strength"
      help="similar to blur"
      step="1"
      min="3"
      max="110"
    ></slider>
    <br>

    <div class="field">
      <label class="label">blur</label>
      <input class="checkbox" type="checkbox" v-model="useBlur">
    </div>
    <div class="field">
      <label class="label">erode</label>
      <input class="checkbox" type="checkbox" v-model="useErode">
    </div>
    <div class="field">
      <label class="label">dilate</label>
      <input class="checkbox" type="checkbox" v-model="useDilate">
    </div>
    <div class="field">
      <label class="label">biggest contour</label>
      <input class="checkbox" type="checkbox" v-model="biggestContour">
    </div>
    <div class="field">
      <label class="label">show webcam and tracker</label>
      <input class="checkbox" type="checkbox" v-model="showVideos">
    </div>
    <div class="field">
      <label class="label">show tracker rect</label>
      <input class="checkbox" type="checkbox" v-model="showTrackerRect">
    </div>
<hr>
    <button class="button" v-on:click="countcontours()">count objects</button>
<br><br>
    <p>object count: {{contoursCount}}</p>
  </div>
</template>

<script>
import Slider from "./Slider.vue";
export default {
  data: () => {
    return {};
  },
  components: {
    slider: Slider
  },
  props: ["size", "blurStrength", "erodeDilateStrength", "fps"]
};
</script>