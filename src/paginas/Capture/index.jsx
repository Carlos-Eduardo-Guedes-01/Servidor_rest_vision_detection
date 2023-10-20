import React, { Component } from 'react';
import axios from 'axios';

class WebcamVideoProcessing extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
        this.canvasRef = React.createRef();
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
                this.captureFrames(stream);
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
            });
    }

    captureFrames(stream) {
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);

        const captureFrame = () => {
            imageCapture.grabFrame()
                .then(imageBitmap => {
                    const canvas = this.canvasRef.current;
                    const context = canvas.getContext('2d');
                    canvas.width = imageBitmap.width;
                    canvas.height = imageBitmap.height;
                    context.drawImage(imageBitmap, 0, 0);

                    // Converte o quadro em um blob
                    canvas.toBlob(frameBlob => {
                        frameBlob.name = 'frame.jpg'; // Define o nome do arquivo como "frame.jpg"
                        this.sendFrameToAPI(frameBlob);
                    }, 'image/jpeg');
                })
                .catch(error => {
                    console.error('Error capturing frame:', error);
                });
        };

        captureFrame();
    }

    sendFrameToAPI(frameBlob) {
        const formData = new FormData();
        formData.append('frame', frameBlob);

        axios.post('http://localhost:8000/video_streaming/', formData)
            .then(async response => {
                const detections = response.data;
                console.log('Detections:', detections);

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
        console.log(detections)
        // Limpar o canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar as bounding boxes no canvas
        detections.forEach(detection => {
            const { xmin, ymin, width, height } = detection;

            // Define o estilo da bounding box
            context.strokeStyle = 'white'; // Cor da bounding box
            context.lineWidth = 2; // Espessura da linha

            // Desenhe a bounding box
            context.strokeRect(xmin, ymin, width, height);
        });
    }

    render() {
        const { error } = this.state;

        return (
            <div>
                <video ref={this.videoRef} autoPlay playsInline muted></video>
                <canvas ref={this.canvasRef} style={{ display: 'block' }}></canvas>
                {error && <div>Error: {error.message}</div>}
                <div>
                    Detections:
                    <ul>
                        {this.state.detections.map((detection, index) => (
                            <li key={index}>{JSON.stringify(detection)}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default WebcamVideoProcessing;
