<template>
  <div>
    <div>
      <label class="label">color</label>
      <br>
      <div class="columns">
        <div class="column">
          <compact-picker v-model="colors"></compact-picker>
        </div>
        <div class="column">
          <label class="label">hsv range</label>
          <p>low: {{lowh}}, {{lows}}, {{lowv}}</p>
          <p>high: {{highh}}, {{highs}}, {{highv}}</p>
        </div>
      </div>
    </div>
    <br>
    <div class="rounded-corners" v-bind:style="{background: backgroundcolor}">&nbsp;</div>
    <br>

    <div class="field">
      <label class="label">hsv</label>
      <p class="help">tweak the color</p>
      <div class="control">
        <input
          class="slider has-output"
          step="1"
          min="0"
          max="255"
          type="range"
          v-model.number="colors.hsv.h"
        >
        <output>{{colors.hsv.h}}</output>
      </div>
      <div class="control">
        <input
          class="slider has-output"
          step="0.01"
          min="0"
          max="1"
          type="range"
          v-model.number="colors.hsv.s"
        >
        <output>{{colors.hsv.s}}</output>
      </div>
      <div class="control">
        <input
          class="slider has-output"
          step="0.01"
          min="0"
          max="1"
          type="range"
          v-model.number="colors.hsv.v"
        >
        <output>{{colors.hsv.v}}</output>
      </div>
    </div>
    <div v-if="advanced">
      <slider
        v-model.number="colorhuesensitivity"
        label="hue sensitivity"
        help="different values for different colors"
        step="0.02"
        min="0"
        max="1"
      ></slider>

      <slider
        v-model.number="colorsaturationsensitivity"
        label="saturation sensitivity"
        help="saturated color is 1, grey is 0"
        step="0.02"
        min="0"
        max="1"
      ></slider>

      <slider
        v-model.number="colorvaluesensitivity"
        label="value sensitivity"
        help="bright is 1, dark is 0"
        step="0.02"
        min="0"
        max="1"
      ></slider>
    </div>
  </div>
</template>
<script>
import VueColor from "vue-color";
import tinycolor from "tinycolor";
export default {
  data: () => {
    return {};
  },
  props: ["colors"],
  components: {
    "compact-picker": VueColor.Compact
  },
  computed: {
    backgroundcolor: function() {
      //return "#FFF";
      return tinycolor(this.colors.hsv).toHexString();
    },

    lowh: function() {
      var x = this.colors.hsv.h;
      var r = x - 255 * this.colorhuesensitivity;
      if (r < 0) return 0;
      return parseInt(r);
    },
    lows: function() {
      var x = this.colors.hsv.s;
      var r = x * 255 - this.colorsaturationsensitivity * 255;
      if (r < 0) return 0;
      return parseInt(r);
    },
    lowv: function() {
      var x = this.colors.hsv.v;
      var r = x * 255 - this.colorvaluesensitivity * 255;
      if (r < 0) return 0;
      return parseInt(r);
    },
    highh: function() {
      var x = this.colors.hsv.h;
      var r = x + 255 * this.colorhuesensitivity;
      if (r > 255) return 255;
      return parseInt(r);
    },
    highs: function() {
      var x = this.colors.hsv.s;
      var r = x * 255 + this.colorsaturationsensitivity * 255;
      if (r > 255) return 255;
      return parseInt(r);
    },
    highv: function() {
      var x = this.colors.hsv.v;
      //console.log(this.colors.hsv);
      var r = x * 255 + this.colorvaluesensitivity * 255;
      if (r > 255) return 255;
      return parseInt(r);
    }
  }
};
</script>