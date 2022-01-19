const chooseFile = document.getElementById("choose-file");
const imgPreview = document.getElementById("img-preview");
const  personName = document.getElementById("person-name");
var sampleImg;

chooseFile.addEventListener("change", function () {
  getImgData();
});

function getImgData() {
  const files = chooseFile.files[0];
  if (files && personName.value != "" ) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    fileReader.addEventListener("load", function () {
      imgPreview.src = this.result;
      sampleImg = this.result;
    });    
  }
  else
  {
    personName.focus();
  }
}   

var mediaStream = null;
function startCapture()
{
    if (personName.value != "" ) 
    {
        var player = document.getElementById('player');

        var handleSuccess = function(stream) {
            mediaStream = stream;
          player.srcObject = stream;
        };
        navigator.mediaDevices.getUserMedia({video: true}).then(handleSuccess);
        $("#captureModal").modal('show');
    }
    else
    {
        personName.focus();
    }
    
}




var captureButton = document.getElementById('capture');
var snapshotCanvas = document.getElementById('snapshot');
captureButton.addEventListener('click', function() {
    var context = snapshot.getContext('2d');
    context.drawImage(player, 0, 0, snapshotCanvas.width,
        snapshotCanvas.height);
    imgPreview.src = context.canvas.toDataURL();
    sampleImg = context.canvas.toDataURL();
    $("#captureModal").modal('hide');
    mediaStream.stop = function () {
        this.getAudioTracks().forEach(function (track) {
            track.stop();
        });
        this.getVideoTracks().forEach(function (track) { 
            track.stop();
        });
    };
    mediaStream.stop();
  });


const video = document.getElementById('video')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('assets/models')
  ])

async function startVideo() {
    if(sampleImg)
    {
        navigator.getUserMedia(
            { video: {} },
            stream => video.srcObject = stream,
            err => console.error(err)
          )
          document.getElementById('img-preview-detect').style.display = "none";
          video.style.display = "block";
          video.play();
          const labeledFaceDescriptors = await loadLabeledImages()
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

         // setInterval(function () {
            if(faceMatcher)
            {
                videoPlay(faceMatcher);
            }
          //}, 1000);

          
    }
    else
    {
        personName.focus();
    }
    

  }


  function videoPlay(faceMatcher) {
   
    const canvas = faceapi.createCanvas(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        var result_label = result.toString().split("(");
        const drawBox = new faceapi.draw.DrawBox(box, { label: result_label[0] })
        drawBox.draw(canvas)
      })
    }, 100)
  }



  function loadLabeledImages() {
    const labels = [personName.value]
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        
        var dataUrl = sampleImg;
       
        const blob = await (await fetch(dataUrl)).blob(); 

          const img = await faceapi.bufferToImage(blob);
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }