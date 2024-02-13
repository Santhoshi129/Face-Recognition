const video = document.getElementById('videoInput')
navigator.getUserMedia(
  { video: {} },
  stream => video.srcObject = stream,
  err => console.error(err)
)
const startVideo = async() => {
  if(document.getElementById("Start").innerHTML == "Start"){
    document.getElementById("Start").innerHTML = "Loading"
    document.getElementById("Start").style.color = "red"
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    await faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    await faceapi.nets.ageGenderNet.loadFromUri('/models')
    document.getElementById("Start").innerHTML = "Stop"
    document.getElementById("Start").style.color = "red"
  }else{
    document.getElementById("Start").innerHTML = "Start"
    document.getElementById("Start").style.color = "green"
    let length = document.getElementsByTagName("canvas").length
    for(let can=0;can<length-1;can++){
      document.getElementsByTagName("canvas")[can].remove()
    }
  }
  }

function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`../images/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
}

video.addEventListener('play', async() =>  {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      resizedDetections.forEach(result => {
          const { age, gender, genderProbability,expressions} = result;
          let expressList = ['neutral' , 'happy' , 'sad' , 'angry' , 'fearful' , 'disgusted' , 'surprised']
          let Emotion;
            for (let i=0 ; i<expressList.length ; i++) {
              for (let j=0 ; j<expressList.length ; j++) {
                if (Emotion == null || Math.round(expressions[expressList[i]]) > Math.round(expressions[expressList[j]]))
                Emotion = expressList[i];
              }
            }
            Emotion = Emotion[0].toUpperCase()+Emotion.slice(1)
          document.getElementById("Age").innerHTML = `🎈 Age : ${Math.round(age)} Years`
          if (gender == "male"){
            document.getElementById("Gender").innerHTML = `🌈 Gender : 🤵 Male`
          }else{
            document.getElementById("Gender").innerHTML = `🌈 Gender : 💁‍♀️ Female`
          }
          document.getElementById("Accuracy").innerHTML = `🚀 Accuracy : ${genderProbability*100}`
          document.getElementById("Emotions").innerHTML = `🤩 Emotions : ${Emotion}`
          new faceapi.draw.DrawTextField(
            [
              `${Math.round(age)} Years`,
              `${gender} (${Math.round(genderProbability)})`
            ],
            result.detection.box.bottomRight
          ).draw(canvas);
        });
      }, 100);
    });

