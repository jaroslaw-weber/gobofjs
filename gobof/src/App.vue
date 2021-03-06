<template>
  <div id="app">
    <section class="section">
      <div class="container">
        <pageloader></pageloader>
        <navbar @navbar=" v => selectedMenu = v" @save="save()" @load="load()"></navbar>
        <br>
        <br>
        <div v-if="selectedMenu=='home'">
          <top></top>
          <br>
          <p>Positional tracking in browser based on color detection with opencv.</p>
        </div>

        <webcam-and-tracker
          :visible="selectedMenu=='webcam' || selectedMenu=='tracker'"
          :isTracking="isTracking"
          :size="config.size"
          :config="config"
          @toggleTracking="toggleTracking()"
        ></webcam-and-tracker>
        <performance
          v-if="selectedMenu=='performance'"
          :config="config"
          @sizeChange="v => config.size = parseInt(v)"
          @fpsChange="v => config.fps = parseInt(v)"
          @blurStrengthChange="v => config.blurStrength = parseInt(v)"
          @erodeDilateStrengthChange="v => config.erodeDilateStrength = parseInt(v)"
          @showTracker="v => config.showTracker = v"
          @showWebcam="v => config.showWebcam = v"
        ></performance>
        <connection :address="config.wsaddress" v-if="selectedMenu=='connection'" @input="v=> config.wsaddress=v"></connection>
        <div v-if="error!=''">
          <error></error>
        </div>
        <config v-if="selectedMenu=='other'" :debugMode="config.debugMode" @debugModeChange="v => config.debugMode = v"></config>
        <color
          :hsv="config.color"
          v-if="selectedMenu=='color'"
          :sensitivity="config.colorSensitivity"
          @picker="v => config.color = v.hsv"
          @h-change="v =>config.color.h = parseFloat(v)"
          @s-change="v =>config.color.s = parseFloat(v)"
          @v-change="v =>config.color.v = parseFloat(v)"
          @sensitivity-h-change="v =>config.colorSensitivity.h = parseFloat(v)"
          @sensitivity-s-change="v =>config.colorSensitivity.s = parseFloat(v)"
          @sensitivity-v-change="v =>config.colorSensitivity.v = parseFloat(v)"
        ></color>
        <sensitivity
          v-if="selectedMenu=='sensitivity'"
          :sensitivity="config.sensitivity"
          @x-change="v => config.sensitivity.x = parseFloat(v)"
          @y-change="v => config.sensitivity.y = parseFloat(v)"
          @z-change="v => config.sensitivity.z = parseFloat(v)"
        ></sensitivity>
        <offset
          v-if="selectedMenu=='offset'"
          :offset="config.offset"
          @x-change="v => config.offset.x = parseFloat(v)"
          @y-change="v => config.offset.y = parseFloat(v)"
          @z-change="v => config.offset.z = parseFloat(v)"
        ></offset>
        <error v-if="error!=''" :error="error"></error>
      </div>
    </section>
  </div>
</template>

<script>
import "bulma/css/bulma.css";
import "bulma-extensions/dist/css/bulma-extensions.min.css";

import Top from "./components/Top.vue";
import Pageloader from "./components/Pageloader.vue";
import WebcamAndTracker from "./components/WebcamAndTracker.vue";
import Error from "./components/Error.vue";
import Config from "./components/Config.vue";
import Color from "./components/Color.vue";
import Sensitivity from "./components/Sensitivity.vue";
import Offset from "./components/Offset.vue";
import Performance from "./components/Performance.vue";
import Navbar from "./components/Navbar.vue";
import Connection from "./components/Connection.vue";

let defaultConfig = {
  id: 1,
  debugMode: false,

  erodeDilateStrength: 0,
  wsaddress: "ws://localhost:8765/",

  colorSensitivity: { h: 0.1, s: 0.4, v: 0.4 },
  showTracker: true,
  showWebcam: true,
  debugMode: true,

  showTrackerRect: true,

  focallength: 0.4,
  sensitivity: { x: 15, y: 15, z: 15 },
  offset: { x: 0, y: 0, z: 0 },
  targetwidth: 5,
  fps: 62,
  color: { h: 80, s: 0.6, v: 0.7 },

  size: 400,
  blurStrength: 2,
  biggestContour: true
};
export default {
  name: "app",
  components: {
    top: Top,
    pageloader: Pageloader,
    navbar: Navbar,
    "webcam-and-tracker": WebcamAndTracker,
    error: Error,
    config: Config,
    color: Color,
    sensitivity: Sensitivity,
    offset: Offset,
    performance: Performance,
    connection: Connection
  },
  methods: {
    onWasmLoaded() {
      this.wasmloaded = true;
    },
    save() {
      localStorage.myconfig = JSON.stringify(this.config);
    },
    load(){
      this.config = JSON.parse(localStorage.myconfig);
    },
    toggleTracking() {
      this.isTracking = !this.isTracking;
      this.config.isTracking = this.isTracking;
      let config = JSON.stringify(this.config);

      console.log(config);
      localStorage.tempConfig = config;
    }
  },
  data: function() {
    return {
      selectedMenu: "home",
      //all config in one place
      config: defaultConfig,
      //is loading page
      isLoading: true,
      //is tracking on
      isTracking: false,
      error: "",
      exported: "",
      //opencv is ready
      wasmloaded: false,
      //webcam is ready
      webcamloaded: false,
      //show advanced settings
      advanced: false,
      //counted contours
      contoursCount: 0,
      //counting contours flag. if used per frame will kill the performance
      contoursCheckFlag: false
    };
  },
  watch: {
    fpscounter: function(v) {
      if (v >= 58) {
        this.fpscolor = "green";
      } else if (v >= 48) {
        this.fpscolor = "orange";
      } else {
        this.fpscolor = "red";
      }
    }
  }
};
</script>

<style>
#app {
  font-family: "Comfortaa", cursive;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
button {
  font-family: "Comfortaa", cursive;
}
</style>
