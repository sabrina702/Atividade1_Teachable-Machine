const URL = "./my_model/"; 
let model, webcam, canvas, labelContainer, maxPredictions, camera_on = false, image_upload = false;
labelContainer = document.getElementById("label-container");
let animationFrameId;
let isWebcamActive = false;

function useWebcam() {
    camera_on = !camera_on;
    if (camera_on) {
        init();
        document.getElementById("webcam").innerHTML = "Fechar Webcam";
    } else {
        stopWebcam();
        document.getElementById("webcam").innerHTML = "Usar Câmera";
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
    await webcam.setup();
    await webcam.play();

    isWebcamActive = true;
    window.requestAnimationFrame(loop);
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    if (!isWebcamActive) return;

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
        
        // Exibir o nome da imagem e a predição
        labelContainer.innerHTML = `<div class="alert alert-info">${bestPrediction.className} (${(bestPrediction.probability * 100).toFixed(2)}%)</div>`;
    } catch (error) {
        console.error("Erro ao fazer a predição:", error);
    }
}

function previewImage() {
    var image = document.querySelector("input[name=image]").files[0];
    var preview = document.getElementById("preview");
    var reader = new FileReader();
    reader.onloadend = () => {
      preview.src = reader.result;
      preview.style.display = "block"; // Mostrar a imagem carregada
      document.getElementById("imageName").innerText = image.name; // Exibir nome da imagem
    };

    if (image) {
      reader.readAsDataURL(image);
      console.log(image);
    } else {
      preview.src = "";
      preview.style.display = "none"; // Ocultar a imagem se nenhum arquivo for carregado
      document.getElementById("imageName").innerText = "";
    }
}
