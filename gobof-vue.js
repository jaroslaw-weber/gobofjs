
var processedFrames = 0;
var fpsCounter = 0
var start = Date.now();
//var h = 100;
//var w = 100;
var low = undefined;
var high = undefined;
var hsv = undefined;
var minradius = 6;
var maxoffset = 0.1;
var colors = { h: 150, s: 0.66, v: 0.30 }
var app = new Vue({
    el: '#tracking',
    components: {
        'compact-picker': VueColor.Compact,
    },
    data: {
        id: 1,
        wsaddress: "ws://localhost:8765/",
        lowh: 30,
        lows: 60,
        lowv: 60,
        highh: 80,
        highs: 230,
        highv: 230,
        ztracking: false,
        focallength: 0.4,
        movingsensitivity: 10,
        zsensitivity: 2,
        targetwidth: 5,
        fps: 65,
        startstoptext: "",
        colors: colors,
        webcamheight: 100,
        webcamwidth: 100,
        trackerheight: 100,
        trackerwidth: 100,
        error: ""
    },
    methods: {
        fpsupdate: function () {
            console.log("fpsupdate");
            var stream = video.srcObject
            var streamsettings = stream.getVideoTracks()[0].getSettings();
            streamsettings.frameRate = app.fps;

        },
        wsupdate: function () {
            console.log("wsupdate");
            ws = new WebSocket(app.wsaddress);

        }
        ,
        save: function () {

            var l = localStorage;
            var a = app;
            l.wsaddress = a.wsaddress;
            l.movingsensitivity = a.movingsensitivity;
            l.lowh = a.lowh;
            l.lows = a.lows;
            l.lowv = a.lowv;
            l.highh = a.highh;
            l.highs = a.highs;
            l.highv = a.highv;
            l.trackerwidth = a.trackerwidth;
            l.trackerheight = a.trackerheight;
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
            l.lowh = parseInt(a.lowh);
            l.lows = parseInt(a.lows);
            l.lowv = parseInt(a.lowv);
            l.highh = parseInt(a.highh);
            l.highs = parseInt(a.highs);
            l.highv = parseInt(a.highv);

            l.trackerwidth = parseInt(a.trackerwidth);
            l.trackerheight = parseInt(a.trackerheight);
            l.webcamwidth = parseInt(a.webcamwidth);
            l.webcamheight = parseInt(a.webcamheight);
            l.zsensitivity = parseInt(a.zsensitivity);
            l.ztracking = a.ztracking;

            app.wsupdate();

        }


    },
    watch:
    {
        webcamheight: function (v) {
            videoInput.height = v;
            //console.log("newh:"+newh);
        },

        webcamwidth: function (v) {
            videoInput.width = v;
            //console.log("newh:"+newh);
        },

        trackerheight: function (v) {
            canvasOutput.height = v;
            //console.log("newh:"+newh);
        },

        trackerwidth: function (v) {
            canvasOutput.width = v;
            //console.log("newh:"+newh);
        }
    }
});

window.onerror = function (error, url, line) {
    app.error = error;
};
//ws = new WebSocket(app.wsaddress);

function startTracking() {

    let ksize = new cv.Size(3, 3);
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    var h = app.trackerheight;
    var w = app.trackerwidth;
    let dsize = new cv.Size(h, w);
    let small = new cv.Mat(h, w, cv.CV_8UC4);
    let video = document.getElementById('webcam');
    let cap = new cv.VideoCapture(video);


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
            if (!streaming) {
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
                fps.innerText = processedFrames / seconds;
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
var maxDistance = app.movingsensitivity * 2; //200cm
var maxz = 200;
var maxoffset = 100;

let streaming = false;
let videoInput = document.getElementById('webcam');
let startAndStop = document.getElementById('startAndStop');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

startAndStop.addEventListener('click', () => {
    if (!streaming) {
        canvasOutput.width = videoInput.videoWidth;
        canvasOutput.height = videoInput.videoHeight;
        onVideoStarted();
    } else {
        onVideoStopped();
    }
});

function onVideoStarted() {
    streaming = true;
    startAndStop.innerText = 'Stop';
    startTracking();
}

function onVideoStopped() {
    streaming = false;
    canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
    startAndStop.innerText = 'Start';
}


var fps = document.querySelector("#fps");
var video = document.querySelector("#webcam");

//todo

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            streaming = false;

        })
        .catch(function (e) {
            app.error = e;
        });
}

//todo
function updatewebsocketaddress() {
    ws = new WebSocket(app.wsaddress);
}

function opencvIsReady() {
    onLoadOpenCv("wasm opencv loaded!")

}
function onLoadOpenCv(message) {
    u("p#opencvloading").html(message);
    console.log(message);
}

//todo
u("button#hsvbtn").on("click", (e) => {
    updateHsvRanges();
});

function updateHsvRanges() {

    let hsvSettings = [app.lowh, app.lows, app.lowv, app.highh, app.highs, app.highv];
    var w = app.trackerwidth;
    var h = app.trackerheight;
    low = new cv.Mat(h, w, hsv.type(), [hsvSettings[0], hsvSettings[1], hsvSettings[2], 0]);
    high = new cv.Mat(h, w, hsv.type(), [hsvSettings[3], hsvSettings[4], hsvSettings[5], 255]);
}
