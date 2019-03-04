<template>
  <div>
    <slider
      v-model.number="yoffset"
      label="y axis offset"
      help="default Y position"
      step="0.5"
      min="-50"
      max="50"
    ></slider>
    <slider
      v-model.number="zoffset"
      label="z axis offset"
      help="default Z position"
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
  props: ["yoffset", "zoffset"]
};
</script>