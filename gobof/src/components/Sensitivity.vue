
<template>
  <div>
    <slider
      v-model.number="movingsensitivity"
      label="movement sensitivity"
      help="sensitivity for x and y axis"
      step="1"
      min="0"
      max="200"
    ></slider>

    <slider
      v-model.number="zsensitivity"
      label="z axis sensitivity"
      help="sensitivity for z axis"
      step="1"
      min="0"
      max="300"
    ></slider>
  </div>
</template>


<script>
module.exports = {
  data: function() {},
  props: ["width", "height"]
};
</script>
