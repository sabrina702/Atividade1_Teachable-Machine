const URL = "./my_model/";

let model, webcam, labelContainer, maxPredictions, camera_on = false, image_upload = false;
labelContainer = document.getElementById("label-container");
let animationFrameId;
let isWebcamActive = false;

// Ativar/desativar a webcam
function useWebcam() {
    camera_on = !camera_on;
    if (camera_on) {
        // Esconde a pré-visualização da imagem e mostra a webcam
        document.getElementById("uploadedImage").style.display = "none"; // Esconde a imagem carregada
        document.getElementById("webcam-container").style.display = "block"; // Mostra a webcam

        // Inicializa a webcam
        init(true); // Passa 'true' para ativar a webcam
        document.getElementById("webcam").innerHTML = "Fechar Webcam";
    } else {
        // Mostra a pré-visualização da imagem e esconde a webcam
        document.getElementById("uploadedImage").style.display = "block"; // Mostra a imagem carregada
        document.getElementById("webcam-container").style.display = "none"; // Esconde a webcam

        // Para a webcam
        stopWebcam(); // Para a webcam
        document.getElementById("webcam").innerHTML = "Usar Câmera";
    }
}

// Parar a webcam e remover elementos
async function stopWebcam() {
    await webcam.stop();
    document.getElementById("webcam-container").removeChild(webcam.canvas);
    labelContainer.innerHTML = "";
    isWebcamActive = false;
    cancelAnimationFrame(animationFrameId);
}

// Iniciar a webcam e carregar o modelo
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

    webcam = new tmImage.Webcam(200, 200, true); // Ajuste da resolução da webcam
    await webcam.setup();
    await webcam.play();
    
    isWebcamActive = true;
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = ""; 
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

// Loop de predição da câmera
async function loop() {
    if (!isWebcamActive) return;
    
    webcam.update();
    await predict(webcam.canvas);
    
    animationFrameId = window.requestAnimationFrame(loop);
}

// Carregar modelo e analisar imagem carregada
async function init_image() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    try {
        model = await tmImage.load(modelURL, metadataURL);  // Carregar o modelo
        const previewImage = document.getElementById("img");  // Pega a imagem carregada

        if (previewImage.src) {
            await predict(previewImage);  // Faz a predição da imagem carregada
        } else {
            alert("Por favor, selecione uma imagem primeiro.");
        }
    } catch (error) {
        console.error("Erro ao carregar o modelo:", error);
    }
}

// Predição do modelo
async function predict(input) {
    try {
        const prediction = await model.predict(input);
        let bestPrediction = prediction.reduce((best, current) => 
            current.probability > best.probability ? current : best, prediction[0]);

        const className = bestPrediction.className;
        const probability = (bestPrediction.probability * 100).toFixed(2);

        // Pega as cores do mapeamento
        const colors = alertColors[className] || alertColors["Desconhecido"]; // Usa "Desconhecido" se não encontrar a classificação

        // Exibe o resultado com as cores dinâmicas
        labelContainer.innerHTML = `<div class="alert" style="background-color: ${colors.bg}; color: ${colors.text};">
                ${className}</div>`;
    } catch (error) {
        console.error("Erro ao fazer a predição:", error);
    }
}

// Pré-visualizar imagem carregada
function previewImage() {
    var image = document.querySelector("input[name=image]").files[0];  // Pega o arquivo da input
    var preview = document.getElementById("img"); // Pega a tag <img> dentro de #uploadedImage
    var reader = new FileReader(); // Cria um FileReader para ler a imagem

    // Quando a leitura do arquivo terminar
    reader.onloadend = () => {
        preview.src = reader.result; // Define o src da imagem com o resultado da leitura
        preview.style.display = "block"; // Exibe a imagem carregada
    };

    if (image) {
        reader.readAsDataURL(image);  // Lê o arquivo como uma URL de dados
        document.getElementById("location-src").innerText = image.name; // Exibe o nome do arquivo
    } else {
        preview.src = "";  // Limpa o conteúdo do src se não houver imagem
        preview.style.display = "none"; // Oculta a imagem
    }
}

// Mapeamento de tipos de resíduos para suas cores
const alertColors = {
    "Plástico": {
        bg: "#dc3545", // Cor de fundo (verde forte)
        text: "#ffffff" // Cor do texto (branco)
    },
    "Metal": {
        bg: "#ffc107", // Cor de fundo (azul forte)
        text: "#ffffff" // Cor do texto (branco)
    },
    "Papel": {
        bg: "#007bff", // Cor de fundo (amarelo forte)
        text: "#000000" // Cor do texto (preto)
    },
    "Vidro": {
        bg: "#28a745", // Cor de fundo (cinza forte)
        text: "#ffffff" // Cor do texto (branco)
    },
    "Desconhecido": {
        bg: "#6c757d", // Cor de fundo (vermelho)
        text: "#ffffff" // Cor do texto (branco)
    }
};

