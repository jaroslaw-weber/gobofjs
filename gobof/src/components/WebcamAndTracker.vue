<template>
  <div>
    <webcam></webcam>
    <tracker></tracker>
  </div>
</template>
<script>
import Webcam from "./Webcam.vue";
import Tracker from "./Tracker.vue";

export default {
  data: () => {
    return {};
  },
  components: {
    webcam: Webcam,
    tracker: Tracker
  },
  computed: {
    videosVisibilityClass: function() {
      if (this.showVideos) return "is-visible";
      return "is-invisible";
    },
    userFriendlyError: function() {
      //if(this.error.includes("1006")) return "could not connect to your headset. run the game before connecting. and check if ip address is correct.";
      return this.error;
    },
    trackingButton: function() {
      if (this.isTracking) return "stop";
      return "start";
    },

    aspect: function() {
      return this.webcamrealheight / this.webcamrealwidth;
    },
    trackerheight: function() {
      return this.webcamheight * this.aspect * this.trackerscale;
    },
    trackerwidth: function() {
      return (this.webcamwidth / this.aspect) * this.trackerscale;
    },
    webcamheight: function() {
      return this.webcamwidth;
    }
  }
};
</script>