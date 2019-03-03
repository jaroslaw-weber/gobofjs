<template>
  <section class="section">
    <div class="container">
      <pageloader></pageloader>
      <header></header>
      <webcam></webcam>
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
import Slider from "./components/Slider.vue";
import Header from "./components/Header.vue";
import Pageloader from "./components/Pageloader.vue";
import Webcam from "./components/Webcam.vue";
import Tracker from "./components/Tracker.vue";
import Error from "./components/Error.vue";
import Config from "./components/Config.vue";
import Color from "./components/Color.vue";
import Sensitivity from "./components/Sensitivity.vue";
import Offset from "./components/Offset.vue";

export default {
  name: "app",
  components: {
    //    "compact-picker": VueColor.Compact,
    slider: Slider,
    header: Header,
    pageloader: Pageloader,
    webcam: Webcam,
    tracker: Tracker,
    error: Error,
    config: Config,
    color: Color,
    sensitivity: Sensitivity,
    offset: Offset
  },
  data: function() {
    return {
      id: 1,
      debugMode: false,
      isLoading: true,
      useBlur: false,
      useErode: false,
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
      fpscolor: "gray",
      isTracking: false,
      colors: { hsv: { h: 80, s: 0.65, v: 0.96 } },
      webcamOn: false,

      webcamwidth: 200,
      blurStrength: 4,

      webcamrealheight: 100,
      webcamrealwidth: 100,
      trackerscale: 1,
      error: "",
      exported: "",
      wasmloaded: false,
      webcamloaded: false,
      advanced: false,
      fpscounter: 0,
      wsstatus: "not connected :(",
      wsstatuscolor: "red",
      loadingText: "loading",
      testSliderValue: 0.2,
      biggestContour: false,
      contoursCount: 0,
      //counting contours flag. if used per frame will kill the performance
      contoursCheckFlag: false,
      showVideos: true
    };
  },
  computed: {
    videosVisibilityClass: function() {
      if (this.showVideos) return "is-visible";
      return "is-invisible";
    },
    backgroundcolor: function() {
      return "#FFF";
      //return tinycolor(this.colors.hsv).toHexString();
    },
    userFriendlyError: function() {
      //if(this.error.includes("1006")) return "could not connect to your headset. run the game before connecting. and check if ip address is correct.";
      return this.error;
    },
    trackingButton: function() {
      if (this.isTracking) return "stop";
      return "start";
    },
    pageloaderClass: function() {
      //if(this.error!="") return "pageloader";
      //if (this.isLoading) return "pageloader is-active";
      return "pageloader";
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
  },
  methods: {
    countcontours: function() {
      this.contoursCheckFlag = true;
    },

    toggleTracking: function() {
      this.isTracking = !this.isTracking;

      if (this.isTracking) {
        //    onVideoStarted();
      } else {
        //  onVideoStopped();
      }
    },
    fpsupdate: function() {
      try {
        /*console.log("fpsupdate");
        if (webcam == undefined) return;
        var stream = webcam.srcObject;
        if (stream == undefined) return;
       */
        //var streamsettings = stream.getVideoTracks()[0].getSettings();
        // streamsettings.frameRate = this.fps;
      } catch (e) {
        this.error = e;
      }
    },
    wsupdate: function() {
      //    console.log("wsupdate");
      try {
        /*ws = new WebSocket(this.wsaddress);
        this.wsstatus = "connecting...";
        this.wsstatuscolor = "orange";
        ws.onerror = () => {
          if (ws.readyState == 1) {
            this.error = "failed to connect to websocket server";
          }
          this.error = "connection error. connection state: " + ws.readyState;
        };

        ws.onopen = () => {
          this.wsstatus = "connected! :)";
          this.wsstatuscolor = "green";
        };
        ws.onclose = e => {
          var err = "Close Code: " + e.code + ", Close Reason: " + e.reason;
          this.error = err;
          console.log(e);
          this.wsstatus = "not connected :(";
          this.wsstatuscolor = "red";
        };
        ws.onmessage = function(e) {
          var server_message = e.data;
          alert(server_message);
          return false;
        };
        */
      } catch (e) {
        this.error = e;
      }
    },
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
  },
  watch: {
    fpscounter: function(v) {
      // console.log("fps:" + v);
      if (v >= 58) {
        this.fpscolor = "green";
      } else if (v >= 48) {
        this.fpscolor = "orange";
      } else {
        this.fpscolor = "red";
      }
    } //,
    //error: v => {
    //      console.log(v);
    //}
  },
  mount: {}
};

/*
window.onerror = function(error, url, line) {
  this.error = error;
};
*/
/*
function startTracking() {
  webcam.play();
  console.log("started tracking!");

  let ksize = new cv.Size(this.blurStrength, this.blurStrength);
  let M = cv.Mat.ones(
    this.erodeDilateStrength,
    this.erodeDilateStrength,
    cv.CV_8U
  );
  let anchor = new cv.Point(-1, -1);
  var h = this.webcamheight;
  var w = this.webcamwidth;
  let dsize = new cv.Size(h, w);
  let small = new cv.Mat(h, w, cv.CV_8UC4);
  //let video = document.getElementById('webcam');
  let cap = new cv.VideoCapture(webcam);

//  console.log("capturing first frame!");

  // take first frame of the video
  let frame = new cv.Mat(webcam.height, webcam.width, cv.CV_8UC4);
  cap.read(frame);
  hsv = new cv.Mat(webcam.height, webcam.width, cv.CV_8UC3);
  let dst = new cv.Mat();

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  updateHsvRanges();

  function processVideo() {
    try {
      if (!this.isTracking) {
        // clean and stop.
        frame.delete();
        dst.delete();
        hsv.delete();
        small.delete();
        contours.delete();
        hierarchy.delete();
        //frame.delete(); dst.delete(); hsvVec.delete(); roiHist.delete(); hsv.delete();
        return;
      }
      let begin = Date.now();

      cap.read(frame);
      //console.log("reading next frame");
      //cv.resize(frame, small, dsize, 0, 0, cv.INTER_NEAREST);
      if (this.useBlur) {
        cv.blur(frame, frame, ksize, anchor, cv.BORDER_DEFAULT);
      }

      cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
      cv.inRange(hsv, low, high, dst);
      if (this.erode) {
        cv.erode(
          dst,
          dst,
          M,
          anchor,
          1,
          cv.BORDER_CONSTANT,
          cv.morphologyDefaultBorderValue()
        );
      }
      if (this.dilate) {
        cv.dilate(
          dst,
          dst,
          M,
          anchor,
          1,
          cv.BORDER_CONSTANT,
          cv.morphologyDefaultBorderValue()
        );
      }
      cv.findContours(
        dst,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      var biggestContour = undefined;
      //var biggestarea = undefined
      var biggestContourIndex = -1;

      if (this.contoursCheckFlag) {
        this.contoursCount = contours.size();
        this.contoursCheckFlag = false;
      }

      if (this.biggestContour) {
        for (var i = 0; i < contours.size(); i++) {
          let contour = contours.get(i);
          if (biggestContour == undefined) {
            biggestContour = contour;
            biggestarea = cv.contourArea(contour, false);
            continue;
          }

          let area = cv.contourArea(contour, false);
          if (area > biggestarea) {
            biggestContour = contour;
            biggestarea = area;
            biggestContourIndex = i;
          }
        }
      } else {
        if (contours.size() >= 1) {
          biggestContourIndex = 0;
          biggestContour = contours.get(0);
        }
      }

      if (biggestContourIndex >= 0) {
        let rect = cv.boundingRect(biggestContour);
        if (this.showTrackerRect) {
          var trackWindow = rect;
          let [_x, _y, _w, _h] = [
            trackWindow.x,
            trackWindow.y,
            trackWindow.width,
            trackWindow.height
          ];
          cv.rectangle(
            dst,
            new cv.Point(_x, _y),
            new cv.Point(_x + _w, _y + _h),
            [255, 0, 0, 255],
            2
          );
        }
        var canvasX = rect.x;
        var canvasY = rect.y;
        var xpercent = canvasX / w - 0.5;
        var ypercent = canvasY / h - 0.5;

        //var distance1 = (rect.width * this.focallength) / w;
        //var distance2 = (rect.height * this.focallength) / h;
        //var distance = (distance1 + distance2) / 2;
        var screenSize = (w + h) / 2;
        var radius = rect.width + rect.height;
        //console.log("distance: "+distance);
        var x = -xpercent * this.movingsensitivity;
        var y = -ypercent * this.movingsensitivity + this.yoffset;
        //var z = this.zsensitivity * distance + this.zoffset;
        var z = this.zsensitivity * (radius / screenSize) + this.zoffset;
        var msg = this.id + "," + x + "," + y + "," + z;
        //console.log(msg);
        try {
          ws.send(msg);
        } catch (e) {
          if (this.debugMode) {
            this.error = e;
          }
        }
      }

      //cv.imshow('trackingCheck', small);
      if (this.showVideos) {
        cv.imshow("canvasOutput", dst);
      }

      // schedule the next one.
      let delay = 1000 / this.fps - (Date.now() - begin);

      processedFrames += 1;
      fpsCounter += 1;
      // only get fps once
      if (fpsCounter == 300) {
        var passed = Date.now() - start;
        var seconds = passed / 1000;
        //fps.innerText = processedFrames / seconds;
        this.fpscounter = processedFrames / seconds;
        fpsCounter = 0;

        start = Date.now();
        processedFrames = 0;
      }

      setTimeout(processVideo, delay);
    } catch (err) {
      if (this.debugMode) {
        this.error = err;
      }
    }
  }

  // schedule the first one.
  setTimeout(processVideo, 0);
}

*/
/*
function onVideoStarted() {
  //startTracking();
  //this.wsupdate();
}

function onVideoStopped() {
  //canvasContext.clearRect(0, 0, this.trackerwidth, this.trackerheight);
}
*/

//todo
/*
function loadwebcam() {
  var md = navigator.mediaDevices;
  if (md.getUserMedia) {
    console.log("getting user media");
    md.getUserMedia({ video: true, audio: false })
      .then(function(stream) {
  //      console.log("stream:" + stream);
        webcam = document.querySelector("#webcam");
//        console.log("webcam: " + webcam);

        webcam.srcObject = stream;
        //var videoTrack = stream.getVideoTracks()[0];
        //console.log(videoTrack);
        webcam.play();

        webcam.onloadeddata = function(e) {
          webcamloaded = true;
        };
      })
      .catch(function(e) {
        this.error = e;
      });
  } else {
    this.error = "failed to get user media";
  }
}

function opencvIsReady() {
  this.isLoading = false;
  this.wasmloaded = true;
}

*/
/*
function updateHsvRanges() {
  console.log("updating hsv ranges");

  let hsvSettings = [
    this.lowh,
    this.lows,
    this.lowv,
    this.highh,
    this.highs,
    this.highv
  ];
  var w = this.webcamwidth;
  var h = this.webcamheight;
  low = new cv.Mat(h, w, hsv.type(), [
    hsvSettings[0],
    hsvSettings[1],
    hsvSettings[2],
    0
  ]);
  high = new cv.Mat(h, w, hsv.type(), [
    hsvSettings[3],
    hsvSettings[4],
    hsvSettings[5],
    255
  ]);
}
*/

if (localStorage.wsaddress) {
  this.wsaddress = localStorage.wsaddress;
}

//ok so the problem was loadwebcam was called too late maybe...
//loadwebcam();

//this.isLoading = false;
</script>

<style></style>
