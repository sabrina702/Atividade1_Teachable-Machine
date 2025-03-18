const URL = "./my_model/";
let model, webcam, canvas, labelContainer, maxPredictions, camera_on = false, image_upload = false;
labelContainer = document.getElementById("label-container");
let animationFrameId;
let isWebcamActive = false;

function useWebcam() {
    camera_on = !camera_on;
    if (camera_on) {
        init();
        document.getElementById("webcam").innerHTML = "Close Webcam";
    } else {
        stopWebcam();
        document.getElementById("webcam").innerHTML = "Start Webcam";
    }
}

async function stopWebcam() {

    await webcam.stop();
    document.getElementById("webcam-container").removeChild(webcam.canvas);
    labelContainer.innerHTML = "";
    
    isWebcamActive = false;
    cancelAnimationFrame(animationFrameId);
}

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    } catch (error) {
        console.error("Erro ao carregar o modelo:", error);
        return;
    }

    webcam = new tmImage.Webcam(200, 200, true);
    await webcam.setup(); // solicita acesso à webcam
    await webcam.play();

    isWebcamActive = true;
    window.requestAnimationFrame(loop);
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    if (!isWebcamActive) return; // Se a webcam não estiver ativa, interrompe o loop

    webcam.update();
    await predict(webcam.canvas);
    
    animationFrameId = window.requestAnimationFrame(loop);
}

async function init_image() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    predict(document.getElementById("preview"));
}

async function predict(input) {

    try {
        const prediction = await model.predict(input);
        let bestPrediction = prediction.reduce((best, current) => 
            current.probability > best.probability ? current : best, prediction[0]);
        console.log(bestPrediction);
        labelContainer.innerHTML = `<div class="alert alert-info">${bestPrediction.className} (${(bestPrediction.probability * 100).toFixed(2)}%)</div>`;
    } catch (error) {
        console.error("Erro ao fazer a predição:", error);
    }
}

function previewImage() {
    var image = document.querySelector("input[name=image]").files[0];
    var preview = document.querySelector("img");
    var reader = new FileReader();
    reader.onloadend = () => {
      preview.src = reader.result;
    };

    if (image) {
      reader.readAsDataURL(image);
      console.log(image);
      document.getElementById("location-src").innerText = image.name;
    } else {
      preview.src = "";
    }
  }
