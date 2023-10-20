function Parar(){
    function stopWebcam() {
        const videoTrack = this.videoRef.current.srcObject.getVideoTracks()[0];
        videoTrack.stop();
    }
    
    return(
    <>
        <div>
            <button onClick={stopWebcam()}>
                Parar
            </button>
        </div>
    </>)
}
export default Parar