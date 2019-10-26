let utils = new Utils('errorMessage');
let streaming = false;
let videoInput = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');
function onVideoStarted() {
    streaming = true;
    let video = document.getElementById('videoInput');
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(video);
    let fists = new cv.RectVector();
    let smiles = new cv.RectVector();
    let fistClassifier = new cv.CascadeClassifier();
    let smileClassifier = new cv.CascadeClassifier();

    // load pre-trained classifiers
    fistClassifier.load('fist.xml');
    smileClassifier.load('haarcascade_mcs_mouth.xml'); //this is maybe wrong

    const FPS = 30;
    function processVideo() {
        try {
            if (!streaming) {
                // clean and stop.
                src.delete();
                dst.delete();
                gray.delete();
                fists.delete();
                smiles.delete();
                fistClassifier.delete();
                smileClassifier.delete();
                return;
            }
            let begin = Date.now();
            // start processing.
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            // detect faces.
            fistClassifier.detectMultiScale(gray, fists, 1.1, 3); //makes an array of all the faces and their x,y,x.length,y.length and stores in 'faces'
            smileClassifier.detectMultiScale(gray, smiles, 1.2, 30); //what do parameters mean??
            // draw faces.
            for (let i = 0; i < fists.size(); ++i) {
                let fist = fists.get(i);
                let point1 = new cv.Point(fist.x, fist.y);
                let point2 = new cv.Point(fist.x + fist.width, fist.y + fist.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            }
            //draw smiles
            for (let i = 0; i < smiles.size(); ++i) {
                let smile = smiles.get(i);
                let point1 = new cv.Point(smile.x, smile.y);
                let point2 = new cv.Point(smile.x + smile.width, smile.y + smile.height);
                cv.rectangle(dst, point1, point2, [0, 255, 0, 255]);
            }
            cv.imshow('canvasOutput', dst);
            // schedule the next one.
            let delay = 1000/FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        } catch (err) {
            utils.printError(err);
        }
    };

    // schedule the first one.
    setTimeout(processVideo, 0);
}
function onVideoStopped() {
    streaming = false;
    canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
}

utils.loadOpenCv(() => {
    let fistCascadeFile = 'fist.xml';
    let smileCascadeFile = 'haarcascade_mcs_mouth.xml';
    utils.createFileFromUrl(fistCascadeFile, fistCascadeFile, () => {
        utils.createFileFromUrl(smileCascadeFile, smileCascadeFile, () => {
            if (!streaming) {
                utils.startCamera('qvga', onVideoStarted, 'videoInput');
            } else {
                utils.stopCamera();
                onVideoStopped();
            }
        });
    });
});
