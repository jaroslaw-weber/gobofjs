
var FPS = 60;

var ws = undefined;
var processedFrames = 0;

var fpsCounter = 0

var start = Date.now();
var focalLength = 0.4;
targetWidth = 5;

onemeter = 100;

function getHsv()
{
var values = [];
["low-h","low-s", "low-v","high-h","high-s", "high-v"].forEach(x =>{
	var e =u("input#"+x);
//	console.log(e);
	var v=e.first().value;
	//console.log(v);
	var vi = parseInt(v);
	values.push(vi);
	
});
//console.log(values);
	return values;
}
function startTracking() {

	let dsize = new cv.Size(130,100);
	let small = new cv.Mat(130, 100, cv.CV_8UC4);
    let video = document.getElementById('webcam');
    let cap = new cv.VideoCapture(video);


    // take first frame of the video
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    cap.read(frame);
    //cv.resize(frame, frame, dsize, 0,0, cv.INTER_AREA);

    // hardcode the initial location of window
    let trackWindow = new cv.Rect(10, 10, 10,10);

    // set up the ROI for tracking
    let roi = frame.roi(trackWindow);
    let hsvRoi = new cv.Mat();
    cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);
    let mask = new cv.Mat();
let ksize = new cv.Size(11, 11);
	let hsvSettings = getHsv();
    let lowScalar = new cv.Scalar(hsvSettings[0],hsvSettings[1],hsvSettings[2] );
    let highScalar = new cv.Scalar(hsvSettings[3],hsvSettings[4],hsvSettings[5]);
    
    let low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
    let high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);
    cv.inRange(hsvRoi, low, high, mask);
    let roiHist = new cv.Mat();
    let hsvRoiVec = new cv.MatVector();
    hsvRoiVec.push_back(hsvRoi);
    cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
    cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

    // delete useless mats.
//    roi.delete(); hsvRoi.delete(); mask.delete(); low.delete(); high.delete(); hsvRoiVec.delete();

    // Setup the termination criteria, either 10 iteration or move by atleast 1 pt
    let termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);

    let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
   let hsvVec = new cv.MatVector();
    hsvVec.push_back(hsv);
    let dst = new cv.Mat();
    let trackBox = null;

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

            // start processing.
            cap.read(frame);
            
            cv.resize(frame, small, dsize, 0,0, cv.INTER_AREA);
            //cv.GaussianBlur(frame, ksize, 0, 0, cv.BORDER_DEFAULT);
            cv.cvtColor(small, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
            cv.calcBackProject(hsvVec, [0], roiHist, dst, [0, 180], 1);

            // apply camshift to get the new location
            //[trackBox, trackWindow] = cv.CamShift(dst, trackWindow, termCrit);

            // Draw it on image
            /*let pts = cv.rotatedRectPoints(trackBox);
            if (pts.length > 0) {
                cv.line(frame, pts[0], pts[1], [255, 0, 0, 255], 3);
                cv.line(frame, pts[1], pts[2], [255, 0, 0, 255], 3);
                cv.line(frame, pts[2], pts[3], [255, 0, 0, 255], 3);
                cv.line(frame, pts[3], pts[0], [255, 0, 0, 255], 3);
                try {
                    sendXYZ(pts);
                    //var ptsAsStr = JSON.stringify(pts);
                    //var xyz = JSON.stringify(pts);
                    //console.log(xyz)
                    //ws.send(xyz);
                } catch (e) {

                }
            }
*/
//mask=hsv;
// You can try more different parameters
//cv.inRange(hsv,low,high,mask);

//cv.inRange(hsv, low, high, hsv);

cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
// draw contours with random Scalar
///console.log("conoturs;"+contours.size())
for (let i = 0; i < contours.size(); ++i) {
    //let ccolor = new cv.Scalar(Math.round(0.3 * 255), Math.round(0.6 * 255),
      //                        Math.round(0.8 * 255));
    cv.drawContours(dst, contours, i, highScalar, 2, cv.FILLED, hierarchy,8);
}

            cv.imshow('canvasOutput',dst);

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
//            utils.printError(err);
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
    z = onemeter-distance; //min -100 (cm), max 100(cm)
    var offset = maxoffset*distance;


    var canvasX = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
    var canvasY = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;
    x = canvasX / canvasOutput.width * onemeter + offset;
    y = canvasY / canvasOutput.height * onemeter+ offset;
    //position.html(`x: ${x}, y:${y}, z${z}, distance: ${distance}, radius(px): ${radius}`)
    ws.send(JSON.stringify([x, y, z]));
}


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

function setFocalLength(v) {
    targetWidth = v;
}
