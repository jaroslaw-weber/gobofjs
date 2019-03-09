
<template>
  <div>
    <slider
      :value="sensitivity.x"
      @input="$emit('x-change', $event)"
      label="x axis sensitivity"
      help="sensitivity for x axis"
      step="1"
      min="0"
      max="200"
    ></slider>

    <slider
      :value="sensitivity.y"
      @input="$emit('y-change', $event)"
      label="y axis sensitivity"
      help="sensitivity for y axis"
      step="1"
      min="0"
      max="200"
    ></slider>

    <slider
      :value="sensitivity.z"
      @input="$emit('z-change', $event)"
      label="z axis sensitivity"
      help="sensitivity for z axis"
      step="1"
      min="0"
      max="200"
    ></slider>
  </div>
</template>


<script>
import Slider from "./Slider.vue";
export default {
  data: function() {
    return {};
  },
  components: {
    slider: Slider
  },
  props: ["sensitivity"]
};
</script>
