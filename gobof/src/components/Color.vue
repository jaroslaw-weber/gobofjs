<template>
  <div>
    <div>
      <label class="label">color</label>
      <br>
      <div class="columns">
        <div class="column">
          <compact-picker @input="$emit('picker', $event)" :value="this.hsv"></compact-picker>
        </div>
        <div class="column">
          <label class="label">hsv range</label>
          <p>low: {{lowh}}, {{lows}}, {{lowv}}</p>
          <p>high: {{highh}}, {{highs}}, {{highv}}</p>
        </div>
      </div>
    </div>
    <br>
    <div class="rounded-corners" :style="{background: backgroundcolor}">&nbsp;</div>
    <br>

    <div class="field">
      <label class="label">hsv</label>
      <p class="help">tweak the color</p>
      <div class="control">
        <input
          class="slider has-output"
          step="1"
          min="0"
          max="360"
          type="range"
          :value="hsv.h"
          @input="$emit('h-change', $event.target.value)"
        >
        <output>{{hsv.h}}</output>
      </div>
      <div class="control">
        <input
          class="slider has-output"
          step="0.01"
          min="0"
          max="1"
          type="range"
          :value="hsv.s"
          @input="$emit('s-change', $event.target.value)"
        >
        <output>{{hsv.s}}</output>
      </div>
      <div class="control">
        <input
          class="slider has-output"
          step="0.01"
          min="0"
          max="1"
          type="range"
          :value="hsv.v"
          @input="$emit('v-change', $event.target.value)"
        >
        <output>{{hsv.v}}</output>
      </div>
    </div>
    <slider
      :value="sensitivity.h"
      @input="$emit('sensitivity-h-change', $event)"
      label="hue sensitivity"
      help="different values for different colors"
      step="0.02"
      min="0"
      max="1"
    ></slider>

    <slider
      :value="sensitivity.s"
      @input="$emit('sensitivity-s-change', $event)"
      label="saturation sensitivity"
      help="saturated color is 1, grey is 0"
      step="0.02"
      min="0"
      max="1"
    ></slider>

    <slider
      :value="sensitivity.v"
      @input="$emit('sensitivity-v-change', $event)"
      label="value sensitivity"
      help="bright is 1, dark is 0"
      step="0.02"
      min="0"
      max="1"
    ></slider>
  </div>
</template>
<script>
import VueColor from "vue-color";
import Slider from "./Slider.vue";
import { TinyColor } from "@ctrl/tinycolor";
export default {
  data: () => {
    return {};
  },
  props: ["hsv", "sensitivity"],
  components: {
    "compact-picker": VueColor.Compact,
    slider: Slider
  },
  computed: {
    backgroundcolor: function() {
      //return "#FFF";
      return new TinyColor(this.hsv).toHexString();
    },

    lowh: function() {
      var x = this.hsv.h;
      var r = x - 255 * this.sensitivity.h;
      if (r < 0) return 0;
      return parseInt(r);
    },
    lows: function() {
      var x = this.hsv.s;
      var r = x * 255 - this.sensitivity.s * 255;
      if (r < 0) return 0;
      return parseInt(r);
    },
    lowv: function() {
      var x = this.hsv.v;
      var r = x * 255 - this.sensitivity.v * 255;
      if (r < 0) return 0;
      return parseInt(r);
    },
    highh: function() {
      var x = this.hsv.h;
      var r = x + 255 * this.sensitivity.h;
      if (r > 255) return 255;
      return parseInt(r);
    },
    highs: function() {
      var x = this.hsv.s;
      var r = x * 255 + this.sensitivity.s * 255;
      if (r > 255) return 255;
      return parseInt(r);
    },
    highv: function() {
      var x = this.hsv.v;
      //console.log(this.colors.hsv);
      var r = x * 255 + this.sensitivity.v * 255;
      if (r > 255) return 255;
      return parseInt(r);
    }
  }
};
</script>