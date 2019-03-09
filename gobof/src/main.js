import Vue from 'vue'
import App from './App.vue'


Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app');


/*


window.onerror = function(error, url, line) {
  App.error = error;
};


function startTracking() {
  webcam.play();
  console.log("started tracking!");

  let ksize = new cv.Size(App.blurStrength, App.blurStrength);
  let M = cv.Mat.ones(
    App.erodeDilateStrength,
    App.erodeDilateStrength,
    cv.CV_8U
  );
  let anchor = new cv.Point(-1, -1);
  var h = App.webcamheight;
  var w = App.webcamwidth;
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
      if (!App.isTracking) {
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
      if (App.useBlur) {
        cv.blur(frame, frame, ksize, anchor, cv.BORDER_DEFAULT);
      }

      cv.cvtColor(frame, hsv, cv.COLOR_RGB2HSV);
      cv.inRange(hsv, low, high, dst);
      if (App.erode) {
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
      if (App.dilate) {
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

      if (App.contoursCheckFlag) {
        App.contoursCount = contours.size();
        App.contoursCheckFlag = false;
      }

      if (App.biggestContour) {
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
        if (App.showTrackerRect) {
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

        //var distance1 = (rect.width * App.focallength) / w;
        //var distance2 = (rect.height * App.focallength) / h;
        //var distance = (distance1 + distance2) / 2;
        var screenSize = (w + h) / 2;
        var radius = rect.width + rect.height;
        //console.log("distance: "+distance);
        var x = -xpercent * App.movingsensitivity;
        var y = -ypercent * App.movingsensitivity + App.yoffset;
        //var z = App.zsensitivity * distance + App.zoffset;
        var z = App.zsensitivity * (radius / screenSize) + App.zoffset;
        var msg = App.id + "," + x + "," + y + "," + z;
        //console.log(msg);
        try {
          ws.send(msg);
        } catch (e) {
          if (App.debugMode) {
            App.error = e;
          }
        }
      }

      //cv.imshow('trackingCheck', small);
      if (App.showVideos) {
        cv.imshow("canvasOutput", dst);
      }

      // schedule the next one.
      let delay = 1000 / App.fps - (Date.now() - begin);

      processedFrames += 1;
      fpsCounter += 1;
      // only get fps once
      if (fpsCounter == 300) {
        var passed = Date.now() - start;
        var seconds = passed / 1000;
        //fps.innerText = processedFrames / seconds;
        App.fpscounter = processedFrames / seconds;
        fpsCounter = 0;

        start = Date.now();
        processedFrames = 0;
      }

      setTimeout(processVideo, delay);
    } catch (err) {
      if (App.debugMode) {
        App.error = err;
      }
    }
  }

  // schedule the first one.
  setTimeout(processVideo, 0);
}

function onVideoStarted() {
  startTracking();
  //App.wsupdate();
}

function onVideoStopped() {
  canvasContext.clearRect(0, 0, App.trackerwidth, App.trackerheight);
}

//todo

function loadwebcam() {
  var md = navigator.mediaDevices;
  if (md.getUserMedia) {
    console.log("getting user media");
    md.getUserMedia({ video: true, audio: false })
      .then(function(stream) {
        console.log("stream:" + stream);
        webcam = document.querySelector("#webcam");
        console.log("webcam: " + webcam);

        webcam.srcObject = stream;
        //var videoTrack = stream.getVideoTracks()[0];
        //console.log(videoTrack);
        webcam.play();

        webcam.onloadeddata = function(e) {
          webcamloaded = true;
        };
      })
      .catch(function(e) {
        App.error = e;
      });
  } else {
    App.error = "failed to get user media";
  }
}

function opencvIsReady() {
  App.isLoading = false;
  App.wasmloaded = true;
}

function updateHsvRanges() {
  console.log("updating hsv ranges");

  let hsvSettings = [
    App.lowh,
    App.lows,
    App.lowv,
    App.highh,
    App.highs,
    App.highv
  ];
  var w = app.webcamwidth;
  var h = App.webcamheight;
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

if (localStorage.wsaddress) {
  app.wsaddress = localStorage.wsaddress;
}
*/