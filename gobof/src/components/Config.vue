<template>
  <div>
    <div>
      <button class="button" v-on:click="save()">save</button>
      <button class="button" v-on:click="load()">load</button>
      <button class="button" v-on:click="reset()">reset</button>
      <button class="button" v-on:click="exportSettings()">export</button>
      <button class="button" v-on:click="load()" disabled>import</button>
      <br>
      <div v-if="exported!=''">
        <br>
        <pre class="box">
              {{exported}}
            </pre>
      </div>
    </div>
    <br>

    <slider
      v-model.number="focallength"
      label="focal length"
      help="differs for different cameras"
      step="0.05"
      min="0.1"
      max="0.7"
    ></slider>

    <slider
      v-model.number="targetwidth"
      label="target width"
      help="width of the object you detecting (cm)"
      step="0.1"
      min="1"
      max="40"
    ></slider>

    <div class="field">
      <label class="label">debug mode</label>
      <p class="help">warning! this may cause worse performance</p>
      <input class="checkbox" type="checkbox" v-model="debugMode">
    </div>
  </div>
</template>
<script>
import Slider from "./Slider.vue";

export default {
  data: () => {
    return {
      exported: ""
    };
  },
  components: { slider: Slider },
  methods: {
    save: function() {
      var settings = JSON.stringify(this.$data);
      localStorage.settings = settings;
    },
    load: function() {
      var settings = JSON.parse(localStorage.settings);
      this.$data = settings;

      for (var key in settings) {
        if (
          key == "wasmloaded" ||
          key == "isLoading" ||
          key == "webcamloaded"
        ) {
          continue;
        }
        //        console.log(key);
        try {
          this.$data[key] = settings[key];
        } catch (e) {
          this.error = e;
        }
      }
      this.wsupdate();
    },

    exportSettings: function() {
      var asJson = JSON.stringify(this.$data, null, "\t");
      this.exported = asJson;
    },

    reset: function() {
      localStorage.clear();
    }
  }
};
</script>
