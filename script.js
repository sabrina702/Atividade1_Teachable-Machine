const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions, camera_on = false, image_upload = false;
labelContainer = document.getElementById("label-container");
document.getElementById("webcam-container").style.display = "none";

let animationFrameId;
let isWebcamActive = false;

function useWebcam() {
    camera_on = !camera_on;
    if (camera_on) {
        document.getElementById("uploadedImage").style.display = "none"; 
        document.getElementById("webcam-container").style.display = "block"; 

       
        init(true); 
        document.getElementById("webcam").innerHTML = "Fechar Câmera";
        webcamButton.classList.add("large"); 
    } else {
        document.getElementById("uploadedImage").style.display = "block"; 
        document.getElementById("webcam-container").style.display = "none"; 

        
        stopWebcam(); 
        document.getElementById("webcam").innerHTML = "Usar Câmera";
        webcamButton.classList.remove("large"); 
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

    document.getElementById("webcam-container").innerHTML = ""; 
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
    
    try {
        model = await tmImage.load(modelURL, metadataURL);  
        const previewImage = document.getElementById("img");  

        if (previewImage.src) {
            await predict(previewImage);  
        } else {
            alert("Por favor, selecione uma imagem primeiro.");
        }
    } catch (error) {
        console.error("Erro ao carregar o modelo:", error);
    }
}


async function predict(input) {
    try {
        const prediction = await model.predict(input);
        let bestPrediction = prediction.reduce((best, current) => 
            current.probability > best.probability ? current : best, prediction[0]);

        const className = bestPrediction.className;
        const probability = (bestPrediction.probability * 100).toFixed(2);

        
        const colors = alertColors[className] || alertColors["Desconhecido"]; 

        labelContainer.innerHTML = `<div class="alert" style="background-color: ${colors.bg}; color: ${colors.text};">
                ${className}</div>`;
    } catch (error) {
        console.error("Erro ao fazer a predição:", error);
    }
}


function previewImage() {
    var image = document.querySelector("input[name=image]").files[0];  
    var preview = document.getElementById("img"); 
    var reader = new FileReader(); 

    reader.onloadend = () => {
        preview.src = reader.result; 
        preview.style.display = "block"; 
    };

    if (image) {
        reader.readAsDataURL(image); 
        document.getElementById("location-src").innerText = image.name; 
    } else {
        preview.src = "";  
        preview.style.display = "none"; 
    }
}

const alertColors = {
    "Plástico": {
        bg: "#dc3545", 
        text: "#ffffff" 
    },
    "Metal": {
        bg: "#ffc107", 
        text: "#ffffff" 
    },
    "Papel": {
        bg: "#007bff", 
        text: "#000000" 
    },
    "Vidro": {
        bg: "#28a745", 
        text: "#ffffff" 
    },
    "Desconhecido": {
        bg: "#6c757d", 
        text: "#ffffff" 
    }
};

