
var processedFrames = 0;
var start = Date.now();
var low = undefined;
var high = undefined;
var hsv = undefined;
var fpsCounter = 0;

var video = document.querySelector("#webcam");
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');


var app = new Vue({
    el: '#tracking',
    components: {
        //'compact-picker': VueColor.Compact,
        'slider-picker': VueColor.Slider,
    },
    data: {
        id: 1,
        isLoading: true,
        wsaddress: "ws://localhost:8765/",
        colorhuesensitivity: 0.2,
        colorsaturationsensitivity: 0.2,
        colorvaluesensitivity: 0.2,

        ztracking: true,
        focallength: 0.4,
        movingsensitivity: 10,
        zsensitivity: 10,
        targetwidth: 5,
        fps: 72,
        fpscolor: "gray",
        //buttontext
        isTracking: false,
        colors: { hsv: { h: 50, s: 0.5, v: 0.5 } },
        //is webcam streaming?
        webcamOn: false,

        webcamwidth: 100,

        webcamrealheight: 11,
        webcamrealwidth: 11,
        trackerscale: 1,
        error: "",
        wasmloaded: false,
        webcamloaded: false,
        advanced: false,
        fpscounter: 0,
        wsstatus: "connecting...",
        wsstatuscolor: "orange",
        loadingText: "loading",
    },
    computed: {
        userFriendlyError: function() {
            //if(this.error.includes("1006")) return "could not connect to your headset. run the game before connecting. and check if ip address is correct.";
            return this.error;
        },
        trackingButton: function(){
            if(this.isTracking) return "stop";
            return "start";
        },
        pageloaderClass: function() {
            //if(this.error!="") return "pageloader";
            if(this.isLoading) return "pageloader is-active";
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
                var stream = video.srcObject
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

            var l = localStorage;
            var a = app;
            l.wsaddress = a.wsaddress;
            l.movingsensitivity = a.movingsensitivity;
            l.webcamwidth = a.webcamwidth;
            l.webcamheight = a.webcamheight;
            l.zsensitivity = a.zsensitivity;
            l.ztracking = a.ztracking;


        }
        ,
        load: function () {

            var a = localStorage;
            var l = app;
            l.wsaddress = a.wsaddress;
            l.movingsensitivity = parseInt(a.movingsensitivity);
            l.webcamwidth = parseInt(a.webcamwidth);
            l.webcamheight = parseInt(a.webcamheight);
            l.zsensitivity = parseInt(a.zsensitivity);
            l.ztracking = a.ztracking;

            app.wsupdate();


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
    console.log("started tracking!");

    let ksize = new cv.Size(3, 3);
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    var h = app.webcamheight;
    var w = app.webcamwidth;
    let dsize = new cv.Size(h, w);
    let small = new cv.Mat(h, w, cv.CV_8UC4);
    let video = document.getElementById('webcam');
    let cap = new cv.VideoCapture(video);

    console.log("capturing first frame!");


    // take first frame of the video
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
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
            cv.blur(small, small, ksize, anchor, cv.BORDER_DEFAULT);

            cv.cvtColor(small, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
            cv.inRange(hsv, low, high, dst);
            cv.erode(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

            cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            var biggestContour = undefined;
            //var biggestarea = undefined
            var biggestContourIndex = -1;
            /*
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
            };*/
            if (contours.size() >= 1) {
                biggestContourIndex = 0;
                biggestContour = contours.get(0);

            }



            if (biggestContourIndex >= 0) {
                let rect = cv.boundingRect(biggestContour);
                var canvasX = rect.x;
                var canvasY = rect.y;
                var xpercent = canvasX / w - 0.5;
                var ypercent = canvasY / h - 0.5;

                var distance = (rect.width * app.focallength) / w;
                //console.log("distance: "+distance);
                var x = - xpercent * app.movingsensitivity
                var y = - ypercent * app.movingsensitivity;
                var z = app.zsensitivity * distance;
                if (!app.ztracking) {
                    z = 0;
                }
                var msg = app.id + "," + x + "," + y + "," + z;
                //console.log(msg);
                try {
                    ws.send(msg);
                } catch (e) {
                    app.error = e;
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
            app.error = err;
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

    if (navigator.mediaDevices.getUserMedia) {
        console.log("getting user media");
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                console.log("stream:"+stream);

                video.srcObject = stream;
                var streamsettings = stream.getVideoTracks()[0].getSettings();
                console.log(streamsettings);
                video.addEventListener("loadeddata", () => {
                    console.log("stream data loaded");
                    var w = video.videoWidth;
                    var h = video.videoHeight;
                    app.webcamrealwidth = w;
                    app.webcamrealheight = h;
                    app.webcamwidth = app.webcamwidth;
                    onVideoStarted();

                });


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
    loadwebcam();
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