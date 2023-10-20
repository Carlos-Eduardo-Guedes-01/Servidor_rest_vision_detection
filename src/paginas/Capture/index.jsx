import React, { Component } from 'react';
import axios from 'axios';

class WebcamVideoProcessing extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
        this.canvasRef = React.createRef();
        this.webcamStream = null;
        this.state = {
            detections: [],
            error: null,
        };
    }

    componentDidMount() {
        this.setupWebcam();
    }

    setupWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.videoRef.current.srcObject = stream;
                this.webcamStream = stream;
                this.captureFrames();
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
            });
    }

    captureFrames() {
        const videoTrack = this.webcamStream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);

        const captureFrame = () => {
            if (this.webcamStream) {
                imageCapture.grabFrame()
                    .then(imageBitmap => {
                        const canvas = this.canvasRef.current;
                        const context = canvas.getContext('2d');
                        canvas.width = imageBitmap.width;
                        canvas.height = imageBitmap.height;
                        context.drawImage(imageBitmap, 0, 0);

                        canvas.toBlob(frameBlob => {
                            frameBlob.name = 'frame.jpg';
                            this.sendFrameToAPI(frameBlob);
                        }, 'image/jpeg');
                        setTimeout(captureFrame, 50);
                    })
                    .catch(error => {
                        console.error('Error capturing frame:', error);
                    })
                    .finally(() => {
                        requestAnimationFrame(captureFrame); // Capture the next frame
                    });
            }
        }

        captureFrame();
    }

    sendFrameToAPI(frameBlob) {
        const formData = new FormData();
        formData.append('frame', frameBlob);

        axios.post('http://127.0.0.1:8000/video_streaming/', formData)
            .then(async response => {
                const detections = response.data;
                this.setState({ detections, error: null });
                this.drawBoundingBoxes(detections);
            })
            .catch(error => {
                console.error('Erro ao enviar quadro para a API:', error);
                this.setState({ error });
            });
    }

    drawBoundingBoxes(detections) {
        const canvas = this.canvasRef.current;
        const context = canvas.getContext('2d');

        // Limpe o canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Defina o estilo das bounding boxes
        context.strokeStyle = 'red'; // Cor da bounding box
        context.lineWidth = 2; // Largura da linha da bounding box

        // Obtém uma referência para o elemento de vídeo
        const video = this.videoRef.current;

        // Calcula a proporção entre as dimensões do vídeo e o tamanho do canvas
        const widthRatio = video.videoWidth / video.clientWidth;
        const heightRatio = video.videoHeight / video.clientHeight;

        // Itera sobre as detecções e cria elementos de bounding box
        detections.forEach(detection => {
            const { xmin, ymin, width, height } = detection;

            // Calcula as posições e dimensões relativas à imagem
            const absoluteX = xmin / widthRatio;
            const absoluteY = ymin / heightRatio;
            const absoluteWidth = width / widthRatio;
            const absoluteHeight = height / heightRatio;

            // Desenhe a bounding box
            context.strokeRect(absoluteX, absoluteY, absoluteWidth, absoluteHeight);
        });
    }

    render() {
        const { error } = this.state;

        return (
            <div style={{ position: 'relative' }}>
                <video ref={this.videoRef} autoPlay playsInline muted></video>
                <canvas
                    ref={this.canvasRef}
                    style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
                ></canvas>
                {error && <div>Error: {error.message}</div>}
                <div>
                    Detections:
                    <ul>
                        {this.state.detections.map((detection, index) => (
                            <li key={index}>{JSON.stringify(detection)}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <button onClick={() => this.stopWebcam()}>Parar</button>
                </div>
            </div>
        );
    }
}

export default WebcamVideoProcessing;