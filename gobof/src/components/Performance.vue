<template>
  <div>
    <div class="field">
      <label class="label">resolution</label>
      <p class="help">{{config.size}} x {{config.size}}</p>
      <div class="control">
        <input
          class="slider has-output"
          step="1"
          min="50"
          max="1000"
          type="range"
          :value="config.size"
          @input="$emit('sizeChange', $event.target.value)"
        >
        <output>{{config.size}}</output>
      </div>
    </div>

    <slider
      :value="config.fps"
      @input="$emit('fpsChange', $event)"
      label="fps"
      help="be careful not to set it too high or too low. adjust depending on the performance"
      step="1"
      min="30"
      max="120"
    ></slider>

    <slider
      :value="config.blurStrength"
      @input="$emit('blurStrengthChange', $event)"
      label="blur strength"
      help="jittery? try blurring the image"
      step="1"
      min="0"
      max="50"
    ></slider>

    <slider
      :value="config.erodeDilateStrength"
      @input="$emit('erodeDilateStrengthChange', $event)"
      label="erode/dilate strength"
      help="similar to blur"
      step="1"
      min="0"
      max="50"
    ></slider>
    <br>
    <div class="field">
      <label class="label">biggest contour</label>
      <input class="checkbox" type="checkbox" :checked="config.biggestContour" @input="$emit('biggestContour', $event.target.checked)">
    </div>
    <div class="field">
      <label class="label">show tracker</label>
      <input class="checkbox" type="checkbox" :checked="config.showTracker" @input="$emit('showTracker', $event.target.checked)">
    </div>
    <div class="field">
      <label class="label">show webcam</label>
      <input class="checkbox" type="checkbox" :checked="config.showWebcam" @input="$emit('showWebcam', $event.target.checked)">
    </div>
    <hr>
    <button class="button">count objects</button>
    <br>
    <br>
    <p>object count: {{config.contoursCount}}</p>
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
  props: ["config"]
};
</script>