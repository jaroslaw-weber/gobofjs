
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


var app = new Vue({
    el: '#tracking',
    components: {
        'compact-picker': VueColor.Compact,
        'slider': Slider,
    },
    data: {
        id: 1,
        debugMode: false,
        isLoading: true,
        useBlur: true,
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

        webcamwidth: 100,
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



});

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
            cv.resize(frame, small, dsize, 0, 0, cv.INTER_NEAREST);
            if (app.useBlur) {

                cv.blur(small, small, ksize, anchor, cv.BORDER_DEFAULT);
            }

            cv.cvtColor(small, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
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

                var distance1 = (rect.width * app.focallength) / w;
                var distance2 = (rect.height * app.focallength) / h;
                var distance = (distance1 + distance2) / 2;
                var radius = rect.width + rect.height;
                //console.log("distance: "+distance);
                var x = - xpercent * app.movingsensitivity
                var y = - ypercent * app.movingsensitivity + app.yoffset;
                //var z = app.zsensitivity * distance + app.zoffset;
                var z = app.zsensitivity * radius + app.zoffset;
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
            cv.imshow('canvasOutput', dst);

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
