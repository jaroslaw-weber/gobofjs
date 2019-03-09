<template>
  <div>
    <slider
      :value="offset.x"
      @input="$emit('x-change', $event)"
      label="x axis offset"
      step="0.5"
      min="-50"
      max="50"
    ></slider>
    <slider
      :value="offset.y"
      @input="$emit('y-change', $event)"
      label="y axis offset"
      step="0.5"
      min="-50"
      max="50"
    ></slider>
    <slider
      :value="offset.z"
      @input="$emit('z-change', $event)"
      label="z axis offset"
      step="0.5"
      min="-50"
      max="50"
    ></slider>
  </div>
</template>

<script>
import Slider from "./Slider.vue";
export default {
  data: () => {return {}},
  components: {slider: Slider},
  props: ["offset"]
};
</script>