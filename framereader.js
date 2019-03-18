let begin = Date.now();
let webcam = document.querySelector("#webcam");
let cap = new cv.VideoCapture(webcam);
let reading = true;

let frame = new cv.Mat(webcam.height, webcam.width, cv.CV_8UC4);

function captureFrame(){
	cap.read(frame);

}

onmessage = function(frameMaterial) {
	console.log("capturing frame...");
	captureFrame();
	console.log("frame captured");
	postMessage("");
  }
