<template>

<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gobof.js - 6dof tracking in browser</title>
  <script src="https://cdn.jsdelivr.net/npm/vue"></script>
  <link rel="stylesheet" href="./bulma-pageloader.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">
  <link rel="stylesheet" href="./bulma-slider.min.css">
  <style>
    .slider {
      width: calc(100% - (5.2rem)) !important;
    }

    output {
      width: 4rem !important;
    }

    .rounded-corners {
      border-radius: 6px;
    }

    .is-invisible {
      display: none;
    }
  </style>
</head>

<body>
  <section class="section">

    <div id="tracking" class="container">
      <div v-bind:class="pageloaderClass">
        <span class="title">{{loadingText}}</span>
      </div>


      <h1 class="title">gobof.js</h1>
      <h2 class="subtitle">positional tracking for oculus go</h2>
      <br>

      <div id="simple">
        <br>
        <div v-bind:class="videosVisibilityClass">
          <div class="box">

            <div class="content">
              <p>your webcam</p>
            </div>
            <video id="webcam" v-bind:width="webcamwidth" v-bind:class="videosVisibilityClass"
              v-bind:height="webcamheight" autoplay muted>


              Your browser does not support the video tag.
            </video>

          </div>
        </div>
        <br>

        <div v-bind:class="videosVisibilityClass">
          <div class="box">
            <div class="content">
              <p>tracking</p>
            </div>
            <canvas id="canvasOutput" v-bind:width="trackerwidth" v-bind:height="trackerheight" muted></canvas>
          </div>
        </div>
        <br>
        <div class="columns">

          <div class="column">
            <div class="control">
              <button class="button is-primary" onclick="loadwebcam()">
                load webcam
              </button>
              <button class="button is-primary" v-on:click="toggleTracking()" :disabled="!wasmloaded">
                {{trackingButton}}
              </button>
              <button class="button is-primary" v-on:click="toggleTracking()" :disabled="!wasmloaded">
                apply changes
              </button>
            </div>
          </div>
          <div class="column" v-if="fpscounter>1">
            <div>
              <p v-bind:style="{color:fpscolor}">fps: {{fpscounter}}</p>
            </div>
          </div>
        </div>


        <div class="columns">
          <div class="column">
            <div>
              <input class="input" v-model="wsaddress" type="text" @input="wsupdate">
            </div>
            <br>
            <div>
              <p v-bind:style="{color:wsstatuscolor}">{{wsstatus}}</p>

            </div>
          </div>

          <div class="column">
            <button class="button is-primary" v-on:click="wsupdate()" :disabled="!wasmloaded">connect</button>
          </div>

        </div>

        <div class="box" v-if="error!=''">
          <p>error: {{ userFriendlyError }}</p>
          <br>
          <button class="button" v-on:click="error=''">Hide Error</button>
        </div>
        <div>

          <button class="button" v-on:click="save()">save</button>
          <button class="button" v-on:click="load()">load</button>
          <button class="button" v-on:click="reset()">reset</button>
          <button class="button" v-on:click="exportSettings()">export</button>
          <button class="button" v-on:click="load()" disabled>import</button>
          <div v-if="exported!=''">
            <br>
            <pre class="box">
              {{exported}}
            </pre>
          </div>
        </div>
      </div>
      <hr>
      <div>
        <div id="settings">


          <div>
            <label class="label">color</label>
            <br>
            <div class="columns">
              <div class="column">
                <compact-picker v-model="colors"></compact-picker>
              </div>
              <div class="column">
                <label class="label">hsv range</label>
                <p> low: {{lowh}}, {{lows}}, {{lowv}}</p>
                <p> high: {{highh}}, {{highs}}, {{highv}}</p>
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
              <input class="slider has-output" step="1" min="0" max="255" type="range" v-model.number="colors.hsv.h">
              <output>{{colors.hsv.h}}</output>
            </div>
            <div class="control">
              <input class="slider has-output" step="0.01" min="0" max="1" type="range" v-model.number="colors.hsv.s">
              <output>{{colors.hsv.s}}</output>
            </div>
            <div class="control">
              <input class="slider has-output" step="0.01" min="0" max="1" type="range" v-model.number="colors.hsv.v">
              <output>{{colors.hsv.v}}</output>
            </div>
          </div>
          <div v-if="advanced">

            <slider v-model.number="colorhuesensitivity" label="hue sensitivity"
              help="different values for different colors" step="0.02" min="0" max="1"></slider>

            <slider v-model.number="colorsaturationsensitivity" label="saturation sensitivity"
              help="saturated color is 1, grey is 0" step="0.02" min="0" max="1"></slider>

            <slider v-model.number="colorvaluesensitivity" label="value sensitivity" help="bright is 1, dark is 0"
              step="0.02" min="0" max="1"></slider>
          </div>
          <hr>


          <div class="field">
            <label class="label">tracker</label>
            <div class="control">
              <label class="radio">
                <input type="radio" name="answer" value="1" v-model.number="id">
                head
              </label>
              <label class="radio">
                <input type="radio" name="answer" value="2" v-model.number="id">
                right hand
              </label>
              <label class="radio">
                <input type="radio" name="answer" value="3" v-model.number="id">
                left hand
              </label>
            </div>
          </div>
          <br>


          <slider v-model.number="movingsensitivity" label="movement sensitivity" help="sensitivity for x and y axis"
            step="1" min="0" max="200"></slider>

          <slider v-model.number="zsensitivity" label="z axis sensitivity" help="sensitivity for z axis" step="1"
            min="0" max="300"></slider>

          <slider v-model.number="yoffset" label="y axis offset" help="default Y position" step="0.5" min="-50"
            max="50"></slider>
          <slider v-model.number="zoffset" label="z axis offset" help="default Z position" step="0.5" min="-50"
            max="50"></slider>

          <hr>
          <br>

          <button v-if="!advanced" class="button" @click="advanced=true">more settings</button>

          <hr v-if="!advanced">
          <!-- below are advanced settings -->
          <div v-if="advanced">
            <div class="field">
              <label class="label">resolution</label>
              <p class="help">{{webcamwidth}} x {{webcamheight}}</p>
              <div class="control">
                <input class="slider has-output" step="1" min="50" max="1000" type="range" v-model.number="webcamwidth">
                <output>{{webcamwidth}}</output>
              </div>
            </div>

            <slider v-model.number="fps" label="fps"
              help="be careful not to set it too high or too low. adjust depending on the performance" step="1" min="30"
              max="120"></slider>


            <slider v-model.number="blurStrength" label="blur strength" help="jittery? try blurring the image" step="1"
              min="3" max="55"></slider>

            <slider v-model.number="erodeDilateStrength" label="erode/dilate strength" help="similar to blur" step="1"
              min="3" max="110"></slider>
            <br>

            <div class="field">
              <label class="label">blur</label>
              <input class="checkbox" type="checkbox" v-model="useBlur">
            </div>
            <div class="field">
              <label class="label">erode</label>
              <input class="checkbox" type="checkbox" v-model="useErode">
            </div>
            <div class="field">
              <label class="label">dilate</label>
              <input class="checkbox" type="checkbox" v-model="useDilate">
            </div>
            <div class="field">
              <label class="label">biggest contour</label>
              <input class="checkbox" type="checkbox" v-model="biggestContour">
            </div>
            <div class="field">
              <label class="label">show webcam and tracker</label>
              <input class="checkbox" type="checkbox" v-model="showVideos">
            </div>
            <div class="field">
              <label class="label">show tracker rect</label>
              <input class="checkbox" type="checkbox" v-model="showTrackerRect">
            </div>
            <br>
            <div>
              <button class="button" v-on:click="countcontours()">count objects</button>
              <br>
              <br>
              <p>
                object count: {{contoursCount}}
              </p>
            </div>
            <br>
            <div class="field">
              <label class="label">debug mode</label>
              <p class="help">warning! this may cause worse performance</p>
              <input class="checkbox" type="checkbox" v-model="debugMode">
            </div>
            <br>

            <slider v-model.number="focallength" label="focal length" help="differs for different cameras" step="0.05"
              min="0.1" max="0.7"></slider>

            <slider v-model.number="targetwidth" label="target width" help="width of the object you detecting (cm)"
              step="0.1" min="1" max="40"></slider>

          </div>


        </div>

        <div>
          <br>
          <div>

            <!--
          <p>select biggest contour (not available, currently first contour only)</p>
          <input class="checkbox" type="checkbox" disabled>
        -->
          </div>

        </div>
      </div>
    </div>


    <script src="./umbrella.min.js"></script>

    <script src="./vue-color/vue-color.min.js"></script>
    <script src="http://bgrins.github.io/TinyColor/tinycolor.js"></script>

    <script src="./gobof-vue.js" type="text/javascript"></script>

    <script>
      //todo: reupload
      //opencv with WASM (faster and smaller)

      
      var Module = {
        wasmBinaryFile: 'https://jaroslaw-weber.github.io/gobofjs/opencv/opencv_js.wasm',
        _main: function () { opencvIsReady(); }
      };
      


    </script>
    <script src="./opencv/opencv.js"></script>
    <script src="./tinycolor.js"></script>

    </div>
  </section>
</body>

</html>


</template>

<script>
import HelloWorld from './components/HelloWorld.vue'


var processedFrames = 0;
var start = Date.now();
var low = undefined;
var high = undefined;
var hsv = undefined;
var fpsCounter = 0;

var webcam = document.querySelector("#webcam");
webcam.addEventListener("error", e => {
    console.log(e);
    app.error = e;
});
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

const Slider = Vue.component('slider', {
    props: ['value', 'label', 'help', 'step', 'min', 'max'],
    template: `
    <div class="field">
        <label class="label">{{label}}</label>
        <p class="help">{{help}}</p>
        <div class="control">
        <input class="slider has-output" v-bind:step="step" v-bind:min="min" v-bind:max="max" type="range"
            v-bind:value="value" v-on:input="$emit('input', $event.target.value)">
        <output>{{value}}</output>
        </div>
    </div>`
})

export default {
  name: 'app',
  components: {
    HelloWorld,
    
        'compact-picker': VueColor.Compact,
        'slider': Slider,
    },
    data: {
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
    },
    computed: {
        videosVisibilityClass: function() {
            if(this.showVideos) return "is-visible";
            return "is-invisible";

        },
        backgroundcolor: function () {
            return tinycolor(this.colors.hsv).toHexString();

        },
        userFriendlyError: function () {
            //if(this.error.includes("1006")) return "could not connect to your headset. run the game before connecting. and check if ip address is correct.";
            return this.error;
        },
        trackingButton: function () {
            if (this.isTracking) return "stop";
            return "start";
        },
        pageloaderClass: function () {
            //if(this.error!="") return "pageloader";
            if (this.isLoading) return "pageloader is-active";
            return "pageloader";
        },
        lowh: function () {
            var x = this.colors.hsv.h;
            var r = x - 255 * this.colorhuesensitivity;
            if (r < 0) return 0;
            return parseInt(r);
        },
        lows: function () {
            var x = this.colors.hsv.s;
            var r = (x * 255) - (this.colorsaturationsensitivity * 255);
            if (r < 0) return 0;
            return parseInt(r);
        },
        lowv: function () {
            var x = this.colors.hsv.v;
            var r = (x * 255) - (this.colorvaluesensitivity * 255);
            if (r < 0) return 0;
            return parseInt(r);
        },
        highh: function () {
            var x = this.colors.hsv.h;
            var r = x + 255 * this.colorhuesensitivity;
            if (r > 255) return 255;
            return parseInt(r);
        },
        highs: function () {
            var x = this.colors.hsv.s;
            var r = (x * 255) + (this.colorsaturationsensitivity * 255);
            if (r > 255) return 255;
            return parseInt(r);
        },
        highv: function () {
            var x = this.colors.hsv.v;
            //console.log(this.colors.hsv);
            var r = (x * 255) + (this.colorvaluesensitivity * 255);
            if (r > 255) return 255;
            return parseInt(r);
        },
        aspect: function () {
            return this.webcamrealheight / this.webcamrealwidth;
        },
        trackerheight: function () {
            return this.webcamheight * this.aspect * this.trackerscale;

        },
        trackerwidth: function () {
            return this.webcamwidth / this.aspect * this.trackerscale;

        },
        webcamheight: function () {
            return this.webcamwidth;
        }
    },
    methods: {
        countcontours: function () {
            app.contoursCheckFlag = true;

        },

        toggleTracking: function () {
            app.isTracking = !app.isTracking;

            if (app.isTracking) {
                onVideoStarted();
            } else {
                onVideoStopped();
            }
        },
        fpsupdate: function () {
            try {
                console.log("fpsupdate");
                if (webcam == undefined) return;
                var stream = webcam.srcObject
                if (stream == undefined) return;
                var streamsettings = stream.getVideoTracks()[0].getSettings();
                streamsettings.frameRate = app.fps;
            } catch (e) {
                app.error = e;
            }

        },
        wsupdate: function () {
            console.log("wsupdate");
            try {
                ws = new WebSocket(app.wsaddress);
                app.wsstatus = "connecting...";
                app.wsstatuscolor = "orange";
                ws.onerror = () => {

                    if (ws.readyState == 1) {
                        app.error = "failed to connect to websocket server"
                    }
                    app.error = "connection error. connection state: " + ws.readyState;
                };

                ws.onopen = () => {
                    app.wsstatus = "connected! :)";
                    app.wsstatuscolor = "green";
                };
                ws.onclose = (e) => {
                    var err = "Close Code: " + e.code + ", Close Reason: " + e.reason;
                    app.error = err;
                    console.log(e);
                    app.wsstatus = "not connected :(";
                    app.wsstatuscolor = "red";
                }
                ws.onmessage = function (e) {
                    var server_message = e.data;
                    alert(server_message);
                    return false;
                }

            } catch (e) {
                app.error = e;

            }

        }
        ,
        save: function () {
            var settings = JSON.stringify(app.$data);
            localStorage.settings = settings;

        }
        ,
        load: function () {
            var settings = JSON.parse(localStorage.settings);
            app.$data = settings;

            for (var key in settings) {
                if (key == "wasmloaded" || key == "isLoading" || key == "webcamloaded") {
                    continue;
                }
                console.log(key);
                try {
                    app.$data[key] = settings[key];
                }
                catch (e) {
                    app.error = e;
                }
            }
            app.wsupdate();


        },

        exportSettings: function () {


            var asJson = JSON.stringify(app.$data, null, "\t");
            app.exported = asJson;


        },

        reset: function () {
            localStorage.clear();
        }
    }
    ,
    watch:
    {
        fpscounter: function (v) {
            console.log("fps:" + v);
            if (v >= 58) {
                this.fpscolor = "green";
            }
            else if (v >= 48) {
                this.fpscolor = "orange";
            }
            else {
                this.fpscolor = "red";
            }
        },
        error: function (v) {
            console.log(v);
        }
    }



};

window.onerror = function (error, url, line) {
    app.error = error;
};

function startTracking() {

    webcam.play();
    console.log("started tracking!");

    let ksize = new cv.Size(app.blurStrength, app.blurStrength);
    let M = cv.Mat.ones(app.erodeDilateStrength, app.erodeDilateStrength, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    var h = app.webcamheight;
    var w = app.webcamwidth;
    let dsize = new cv.Size(h, w);
    let small = new cv.Mat(h, w, cv.CV_8UC4);
    //let video = document.getElementById('webcam');
    let cap = new cv.VideoCapture(webcam);

    console.log("capturing first frame!");


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
            if (!app.isTracking) {
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
            if (app.useBlur) {

                cv.blur(frame, frame, ksize, anchor, cv.BORDER_DEFAULT);
            }

            cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
            cv.inRange(hsv, low, high, dst);
            if (app.erode) {

                cv.erode(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            }
            if (app.dilate) {

                cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            }
            cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            var biggestContour = undefined;
            //var biggestarea = undefined
            var biggestContourIndex = -1;

            if(app.contoursCheckFlag)
            {
                app.contoursCount = contours.size();
                app.contoursCheckFlag = false;
            }

            if (app.biggestContour) {
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
                };

            }
            else {
                if (contours.size() >= 1) {
                    biggestContourIndex = 0;
                    biggestContour = contours.get(0);

                }

            }



            if (biggestContourIndex >= 0) {
                let rect = cv.boundingRect(biggestContour);
                if (app.showTrackerRect) {
                    var trackWindow = rect;
                    let [_x, _y, _w, _h] = [trackWindow.x, trackWindow.y, trackWindow.width, trackWindow.height];
                    cv.rectangle(dst, new cv.Point(_x, _y), new cv.Point(_x + _w, _y + _h), [255, 0, 0, 255], 2);
                }
                var canvasX = rect.x;
                var canvasY = rect.y;
                var xpercent = canvasX / w - 0.5;
                var ypercent = canvasY / h - 0.5;

                //var distance1 = (rect.width * app.focallength) / w;
                //var distance2 = (rect.height * app.focallength) / h;
                //var distance = (distance1 + distance2) / 2;
                var screenSize = (w+h)/2;
                var radius = rect.width + rect.height;
                //console.log("distance: "+distance);
                var x = - xpercent * app.movingsensitivity
                var y = - ypercent * app.movingsensitivity + app.yoffset;
                //var z = app.zsensitivity * distance + app.zoffset;
                var z = app.zsensitivity * (radius/screenSize) + app.zoffset;
                var msg = app.id + "," + x + "," + y + "," + z;
                //console.log(msg);
                try {
                    ws.send(msg);
                } catch (e) {
                    if (app.debugMode) {
                        app.error = e;
                    }
                }

            }




            //cv.imshow('trackingCheck', small);
            if(app.showVideos)
            {
                
                cv.imshow('canvasOutput', dst);
            }

            // schedule the next one.
            let delay = 1000 / app.fps - (Date.now() - begin);

            processedFrames += 1;
            fpsCounter += 1
            // only get fps once
            if (fpsCounter == 300) {
                var passed = Date.now() - start;
                var seconds = passed / 1000;
                //fps.innerText = processedFrames / seconds;
                app.fpscounter = processedFrames / seconds;
                fpsCounter = 0;

                start = Date.now();
                processedFrames = 0;



            }

            setTimeout(processVideo, delay);
        } catch (err) {
            if (app.debugMode) {
                app.error = err;

            }
        }
    };

    // schedule the first one.
    setTimeout(processVideo, 0);
}



function onVideoStarted() {

    startTracking();
    //app.wsupdate();
}

function onVideoStopped() {
    canvasContext.clearRect(0, 0, app.trackerwidth, app.trackerheight);
}


//todo


function loadwebcam() {

    var md = navigator.mediaDevices;
    if (md.getUserMedia) {
        console.log("getting user media");
        md.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                console.log("stream:" + stream);
                webcam = document.querySelector("#webcam");
                console.log("webcam: " + webcam);

                webcam.srcObject = stream;
                //var videoTrack = stream.getVideoTracks()[0];
                //console.log(videoTrack);
                webcam.play();

                webcam.onloadeddata = function (e) {
                    webcamloaded = true;
                };


            })
            .catch(function (e) {
                app.error = e;
            });
    }
    else {
        app.error = "failed to get user media";
    }
}



function opencvIsReady() {
    app.isLoading = false;
    app.wasmloaded = true;

}

function updateHsvRanges() {
    console.log("updating hsv ranges");

    let hsvSettings = [app.lowh, app.lows, app.lowv, app.highh, app.highs, app.highv];
    var w = app.webcamwidth;
    var h = app.webcamheight;
    low = new cv.Mat(h, w, hsv.type(), [hsvSettings[0], hsvSettings[1], hsvSettings[2], 0]);
    high = new cv.Mat(h, w, hsv.type(), [hsvSettings[3], hsvSettings[4], hsvSettings[5], 255]);
}

if (localStorage.wsaddress) {
    app.wsaddress = localStorage.wsaddress;
}

//ok so the problem was loadwebcam was called too late maybe...
//loadwebcam();

//app.isLoading = false;

</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
