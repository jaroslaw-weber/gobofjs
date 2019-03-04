<template>
  <section class="section">
    <div class="container">
      <pageloader></pageloader>
      <top></top>
      <webcam-and-tracker></webcam-and-tracker>
      <tracker></tracker>
      <connection></connection>
      <error></error>
      <config></config>
      <color></color>
      <sensitivity></sensitivity>
      <offset></offset>
    </div>
  </section>
</template>

<script>
import "bulma/css/bulma.css";

import Top from "./components/Top.vue";
import Pageloader from "./components/Pageloader.vue";
import WebcamAndTracker from "./components/WebcamAndTracker.vue";
import Tracker from "./components/Tracker.vue";
import Error from "./components/Error.vue";
import Config from "./components/Config.vue";
import Color from "./components/Color.vue";
import Sensitivity from "./components/Sensitivity.vue";
import Offset from "./components/Offset.vue";

let defaultConfig = {
  id: 1,
  debugMode: false,
  useBlur: false,
  useErode: true,
  useDilate: false,
  erodeDilateStrength: 3,
  wsaddress: "ws://localhost:8765/",
  colorhuesensitivity: 0.1,
  colorsaturationsensitivity: 0.4,
  colorvaluesensitivity: 0.4,
  showTrackerRect: true,
  ztracking: true,
  focallength: 0.4,
  movingsensitivity: 10,
  zoffset: 0,
  yoffset: 0,
  zsensitivity: 100,
  targetwidth: 5,
  fps: 72,
  colors: { hsv: { h: 80, s: 0.65, v: 0.96 } },
  webcamOn: false,

  webcamwidth: 200,
  blurStrength: 4,

  webcamrealheight: 100,
  webcamrealwidth: 100,
  trackerscale: 1,

  showVideos: true,
  biggestContour: false
};
export default {
  name: "app",
  components: {
    top: Top,
    pageloader: Pageloader,
    "webcam-and-tracker": WebcamAndTracker,
    error: Error,
    config: Config,
    color: Color,
    sensitivity: Sensitivity,
    offset: Offset
  },
  data: function() {
    return {
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

<style></style>
