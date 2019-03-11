//require("./opencv/opencv.js");
//import OpenCv from "./opencv/opencv.js";



let config = {
	webcam: undefined,
	blurStrength: undefined,
	errodeDilateStrength: undefined,
	size: undefined,
	ws: undefined,
	isTracking: false
};
let hsv = undefined;
let high = undefined;
let low = undefined;
let cv = undefined;

let fpsCounter = 0;



function startTracking() {
	console.log("start tracking");
	let webcam = config.webcam;
	webcam.play();

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

	//console.log("capturing first frame!");

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
			if (!config.isTracking) {
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

			let start = Date.now();

			cap.read(frame);
			//console.log("reading next frame");
			//cv.resize(frame, small, dsize, 0, 0, cv.INTER_NEAREST);
			if (config.useBlur) {
				cv.blur(frame, frame, ksize, anchor, cv.BORDER_DEFAULT);
			}

			cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
			cv.inRange(hsv, low, high, dst);
			if (config.erode) {
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
			if (config.dilate) {
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
				cv.CHAIN_configROX_SIMPLE
			);

			let biggestContour = undefined;
			let biggestarea = undefined
			let biggestContourIndex = -1;

			if (config.contoursCheckFlag) {
				config.contoursCount = contours.size();
				config.contoursCheckFlag = false;
			}

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
				var x = -xpercent * config.movingsensitivity;
				var y = -ypercent * config.movingsensitivity + config.yoffset;
				//var z = config.zsensitivity * distance + config.zoffset;
				var z = config.zsensitivity * (radius / screenSize) + config.zoffset;
				var msg = config.id + "," + x + "," + y + "," + z;
				//console.log(msg);
				try {
					config.ws.send(msg);
				} catch (e) {
					if (config.debugMode) {
						config.error = e;
					}
				}
			}

			//cv.imshow('trackingCheck', small);
			if (config.showVideos) {
				cv.imshow("canvasOutput", dst);
			}

			// schedule the next one.
			let delay = 1000 / config.fps - (Date.now() - begin);

			fpsCounter += 1;
			// only get fps once
			if (fpsCounter == 300) {
				var passed = Date.now() - start;
				var seconds = passed / 1000;
				//fps.innerText = processedFrames / seconds;
				config.fpscounter = fpsCounter / seconds;
				fpsCounter = 0;

				start = Date.now();
			}

			setTimeout(processVideo, delay);
		} catch (err) {
			if (config.debugMode) {
				config.error = err;
			}
		}
	}

	// schedule the first one.
	setTimeout(processVideo, 0);
}



function opencvIsReady() {
	console.log("wasm opencv is loaded!");


}

function updateHsvRanges() {
	console.log("updating hsv ranges");

	let hsvSettings = [app.lowh, app.lows, app.lowv, app.highh, app.highs, app.highv];
	var w = app.webcamwidth;
	var h = app.webcamheight;
	low = new cv.Mat(h, w, hsv.type(), [hsvSettings[0], hsvSettings[1], hsvSettings[2], 0]);
	high = new cv.Mat(h, w, hsv.type(), [hsvSettings[3], hsvSettings[4], hsvSettings[5], 255]);
}

//todo: reupload
//opencv with WASM (faster and smaller)

console.log("start loading wasm module...");

var Module = {
	wasmBinaryFile: './opencv/opencv_js.wasm',
	_main: function () { opencvIsReady(); }
};

function loadConfig()
{
	var configJson = localStorage.getItem("tempconfig");
	console.log(configJson);
	config = JSON.parse(configJson);
	console.log(config);
}

document.querySelector("#trackerbutton").addEventListener("click", () => {
	console.log("click on tracker button");
	setTimeout(() => {
		loadConfig();
		startTracking();
	}, 1000);
});
