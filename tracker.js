//require("./opencv/opencv.js");
//import OpenCv from "./opencv/opencv.js";



let config = { };
let hsv = undefined;
let high = undefined;
let low = undefined;
let ws = undefined;

let workerFrames = [];


function startTracking() {
	
	let fpsCounter = 0;
	//let cv = window.cv;
	console.log("start tracking");
	console.log(config);
	let webcam = document.querySelector("#webcam");
	let canvasOutput = document.querySelector("#canvasOutput");
	webcam.play();
	hsv = new cv.Mat(webcam.height, webcam.width, cv.CV_8UC3);
	

	let ksize = new cv.Size(config.blurStrength, config.blurStrength);
	let M = cv.Mat.ones(
		config.erodeDilateStrength,
		config.erodeDilateStrength,
		cv.CV_8U
	);
	let anchor = new cv.Point(-1, -1);
	var h = config.size;
	var w = config.size;
	//let dsize = new cv.Size(h, w);
	let small = new cv.Mat(h, w, cv.CV_8UC4);
	//let video = document.getElementById('webcam');
	let cap = new cv.VideoCapture(webcam);
	let fpsDisplay= document.querySelector("#fps");

	//console.log("capturing first frame!");

	// take first frame of the video
	let frame = new cv.Mat(webcam.height, webcam.width, cv.CV_8UC4);
	//let w = new Worker("./framereader.js");
	//w.onmessage = "message from worker!";
	//w.postMessage(frame);
	//cap.read(frame);
	let dst = new cv.Mat();

	let contours = new cv.MatVector();
	let hierarchy = new cv.Mat();
	updateHsvRanges();
	let start = Date.now();

	function processVideo() {
		try {
			if (!config.isTracking) {
				console.log("stopping tracking...");
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


			//console.log("reading frame");
			cap.read(frame);
			
			//console.log("reading next frame");
			//cv.resize(frame, small, dsize, 0, 0, cv.INTER_NEAREST);
			if (config.blurStrength > 0) {
				cv.blur(frame, frame, ksize, anchor, cv.BORDER_DEFAULT);
			}

			cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
			cv.inRange(hsv, low, high, dst);
			if (config.erodeDilateStrength > 0) {
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
			if (config.erodeDilateStrength > 0) {
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
			//console.log("finding contours");
			cv.findContours(
				dst,
				contours,
				hierarchy,
				cv.RETR_EXTERNAL,
				cv.CHAIN_APPROX_SIMPLE
			);
			//console.log("contours find check");

			let biggestContour = undefined;
			let biggestarea = undefined
			let biggestContourIndex = -1;
/*
			if (config.contoursCheckFlag) {
				config.contoursCount = contours.size();
				config.contoursCheckFlag = false;
			}
			*/

			//console.log("getting biggest contour");
			if (config.biggestContour) {
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
			//console.log(biggestContourIndex + " biggest");
			if (biggestContourIndex >= 0) {
				let rect = cv.boundingRect(biggestContour);
				if (config.showTrackerRect) {
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

				//var distance1 = (rect.width * config.focallength) / w;
				//var distance2 = (rect.height * config.focallength) / h;
				//var distance = (distance1 + distance2) / 2;
				var screenSize = (w + h) / 2;
				var radius = rect.width + rect.height;
				//console.log("distance: "+distance);
				var x = -xpercent * config.sensitivity.x + config.offset.x;
				var y = -ypercent * config.sensitivity.y + config.offset.y;
				//var z = config.zsensitivity * distance + config.zoffset;
				var z = config.sensitivity.z * (radius / screenSize) + config.offset.z;
				var msg = config.id + "," + x + "," + y + "," + z;
				//console.log("position: " + msg);
				try {
					ws.send(msg);
				} catch (e) {
					if (config.debugMode) {
						config.error = e;
						console.log("error: "+e);
					}
				}
			}

			//console.log("drawing?");
			//cv.imshow('trackingCheck', small);
			if (config.showTracker) {
				//console.log("drawing");
				cv.imshow("canvasOutput", dst);
			}

			// schedule the next one.
			let delay = 1000 / config.fps - (Date.now() - begin);

			fpsCounter += 1;
			// only get fps once
			if (fpsCounter == 300) {
				let now = Date.now();
				var passed = now - start;
				var seconds = passed / 1000;
				//fps.innerText = processedFrames / seconds;
				config.fpscounter = fpsCounter / seconds;
				fpsDisplay.innerHTML = parseInt(fpsCounter / seconds)+ " fps";
				fpsCounter = 0;


				start = Date.now();
			}

			setTimeout(processVideo, delay);
		} catch (err) {
			//console.log(err);
			if (config.debugMode) {
				console.log(err);
				config.error = err;
			}
			//setTimeout(processVideo, 0.1);
		}
	}

	// schedule the first one.
	setTimeout(processVideo, 0);
}



function opencvIsReady() {
	console.log("wasm opencv is loaded!");


}

function updateHsvRanges() {
	//console.log("updating hsv ranges");
	var h = config.size;
	var w = config.size;
	//console.log(config.size);
	let hsvSettings = getHsvSettings();

	//console.log(hsvSettings);
	let lowdata = [h, w, hsv.type(), hsvSettings[0], hsvSettings[1], hsvSettings[2], 0];
	//console.log(lowdata);
	low = new cv.Mat(h, w, hsv.type(), [hsvSettings[0], hsvSettings[1], hsvSettings[2], 0]);
	high = new cv.Mat(h, w, hsv.type(), [hsvSettings[3], hsvSettings[4], hsvSettings[5], 255]);
}

function getHsvSettings() {

	let hsvSettings = [lowh(), lows(), lowv(), highh(), highs(), highv()];
	return hsvSettings;
}

//todo: same code in color.vue, refactor
function lowh() {
	var x = config.color.h;
	var r = x - 255 * config.colorSensitivity.h;
	if (r < 0) return 0;
	return parseInt(r);
}
function lows() {
	var x = config.color.s;
	var r = x * 255 - config.colorSensitivity.s * 255;
	if (r < 0) return 0;
	return parseInt(r);
}
function lowv() {
	var x = config.color.v;
	var r = x * 255 - config.colorSensitivity.v * 255;
	if (r < 0) return 0;
	return parseInt(r);
}
function highh() {
	var x = config.color.h;
	var r = x + 255 * config.colorSensitivity.h;
	if (r > 255) return 255;
	return parseInt(r);
}
function highs() {
	var x = config.color.s;
	var r = x * 255 + config.colorSensitivity.s * 255;
	if (r > 255) return 255;
	return parseInt(r);
}
function highv() {
	var x = config.color.v;
	//console.log(config.colors.hsv);
	var r = x * 255 + config.colorSensitivity.v * 255;
	if (r > 255) return 255;
	return parseInt(r);
}


//todo: reupload
//opencv with WASM (faster and smaller)

console.log("start loading wasm module...");

var Module = {
	wasmBinaryFile: './opencv/opencv_js.wasm',
	_main: function () { opencvIsReady(); }
};

function loadConfig() {
	var configJson = localStorage.tempConfig;
	config = JSON.parse(configJson);
	ws = new WebSocket(config.wsaddress);
	//startTracking();
}

document.querySelector("#trackerbutton").addEventListener("click", () => {
	console.log("click on tracker button");
	setTimeout(() => {
		loadConfig();
		startTracking();
	},200);
});
