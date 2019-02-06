
var FPS = 60;

var ws = undefined;
var processedFrames = 0;

var fpsCounter = 0

var start = Date.now();
var focalLength = 0.4;
targetWidth = 5;

var h = 100;
var w = 100;
var low = undefined;
var high = undefined;
var hsv = undefined;
var minradius = 6;
onemeter = 100;


function getHsv() {
    var values = [];
    ["low-h", "low-s", "low-v", "high-h", "high-s", "high-v"].forEach(x => {
        var e = u("input#" + x);
        //	console.log(e);
        var v = e.first().value;
        //console.log(v);
        var vi = parseInt(v);
        values.push(vi);

    });
    //console.log(values);
    return values;
}
function startTracking() {

    let ksize = new cv.Size(3, 3);
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    let dsize = new cv.Size(h, w);
    let small = new cv.Mat(h, w, cv.CV_8UC4);
    let video = document.getElementById('webcam');
    let cap = new cv.VideoCapture(video);


    // take first frame of the video
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    //cv.resize(frame, frame, dsize, 0,0, cv.INTER_AREA);

    // hardcode the initial location of window
    let trackWindow = new cv.Rect(10, 10, 10, 10);

    // set up the ROI for tracking
    let roi = frame.roi(trackWindow);
    let hsvRoi = new cv.Mat();
    cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);
    let mask = new cv.Mat();

    let roiHist = new cv.Mat();
    let hsvRoiVec = new cv.MatVector();
    hsvRoiVec.push_back(hsvRoi);
    cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
    cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);



    hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
    updateHsvRanges();
    let hsvVec = new cv.MatVector();
    hsvVec.push_back(hsv);
    let dst = new cv.Mat();

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    function processVideo() {
        try {
            if (!streaming) {
                // clean and stop.
                frame.delete(); dst.delete(); hsvVec.delete(); roiHist.delete(); hsv.delete();
                return;
            }
            let begin = Date.now();

            cap.read(frame);
            cv.resize(frame, small, dsize, 0, 0, cv.INTER_AREA);
            cv.GaussianBlur(small, small, ksize, 0, 0, cv.BORDER_DEFAULT);

            cv.cvtColor(small, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
            cv.inRange(hsv, low, high, dst);
            cv.erode(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            cv.dilate(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
            
            cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
            //console.log("conoturs;"+contours.size())
            
            var biggestContour = undefined;
            var biggestarea = undefined
            var biggestContourIndex = -1;
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
                


                //let ccolor = new cv.Scalar(Math.round(0.3 * 255), Math.round(0.6 * 255),
                //                        Math.round(0.8 * 255));
                //cv.drawContours(small, contours, i, [255,0,0,255], 2, cv.FILLED, hierarchy,8);
            };
            if(biggestContourIndex>=0)
            {
                //console.log("area:"+area);
                cv.drawContours(small, contours, biggestContourIndex, [255, 0, 0, 255], 2, cv.FILLED, hierarchy,8);
                let rect = cv.boundingRect(biggestContour);
                /*
                let Moments = cv.moments(biggestContour, false);
                let x = M.m10/M.m00
                let y = M.m01/M.m00
                let radius = rect[1].x - rect[0].x;
                */
               var canvasX = rect.x;
               var canvasY = rect.y;
               var distance = (rect.width * focalLength) / canvasOutput.width;
               var offset = maxoffset * distance;
               var x = canvasX / canvasOutput.width * onemeter + offset;
               var y = canvasY / canvasOutput.height * onemeter + offset;
               z = onemeter - distance; //min -100 (cm), max 100(cm)

                ws.send(JSON.stringify([x, y, z]));

            }
            
            
            cv.imshow('trackingCheck', small);
            cv.imshow('canvasOutput', dst);

            // schedule the next one.
            let delay = 1000 / FPS - (Date.now() - begin);

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
            console.log(err);
        }
    };

    // schedule the first one.
    setTimeout(processVideo, 0);
}
var maxDistance = onemeter * 2; //200cm
var maxz = 200;
var maxoffset = 100;


function sendXYZ(pts) {
    radius = Math.abs(pts[0].x - pts[1].x);
    distance = (targetWidth * focalLength) / canvasOutput.width;
    z = onemeter - distance; //min -100 (cm), max 100(cm)
    var offset = maxoffset * distance;


    var canvasX = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
    var canvasY = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;
    x = canvasX / canvasOutput.width * onemeter + offset;
    y = canvasY / canvasOutput.height * onemeter + offset;
    //position.html(`x: ${x}, y:${y}, z${z}, distance: ${distance}, radius(px): ${radius}`)
    ws.send(JSON.stringify([x, y, z]));
}


let streaming = false;
let videoInput = document.getElementById('webcam');
let startAndStop = document.getElementById('startAndStop');
let canvasOutput = document.getElementById('canvasOutput');
let trackingCheck = document.getElementById('trackingCheck');
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

function setFps(fpsNo) {
    FPS = fpsNo;
    var stream = video.srcObject
    var streamsettings = stream.getVideoTracks()[0].getSettings();
    streamsettings.frameRate = fpsNo
}

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            streaming = false;
            setFps(FPS);

        })
        .catch(function (err0r) {
            console.log("Something went wrong!");
        });
}

function updatewebsocketaddress() {
    var a = document.querySelector("#wsaddress");
    setWebsocketServer(a.value);
}
function setWebsocketServer(address) {
    if (address == "") {
        console.log("using default address");
        address = "ws://localhost:8765/";
    }
    console.log("changing websocket server to: " + address)
    ws = new WebSocket(address);
    console.log("changed websocket server to: " + address)
}
function opencvIsReady() {
    onLoadOpenCv("wasm opencv loaded!")

}
function onLoadOpenCv(message) {
    u("p#opencvloading").html(message);
    console.log(message);
}


u("input#focallength").on("change", (e) => setFocalLength(e.currentTarget.value));

function setFocalLength(v) {
    console.log("focal length: " + v);
    focalLength = v;
}


u("input#targetwidth").on("change", (e) => setTargetWidth(e.currentTarget.value));
u("button#hsvbtn").on("click", (e) => {
    updateHsvRanges();
});

function updateHsvRanges() {
    let hsvSettings = getHsv();

    low = new cv.Mat(h, w, hsv.type(), [hsvSettings[0], hsvSettings[1], hsvSettings[2], 0]);
    high = new cv.Mat(h, w, hsv.type(), [hsvSettings[3], hsvSettings[4], hsvSettings[5], 255]);
}
function setFocalLength(v) {
    targetWidth = v;
}
