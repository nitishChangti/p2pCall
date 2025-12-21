import { useEffect, useRef, useState } from "react";
import { webrtcStore } from "../socket/webrtcStore";
import { cleanupWebRTC } from "../socket/webrtc";
import { getSocket } from "../socket/socketClient";
import { useNavigate, useParams } from "react-router-dom";

export default function CallView() {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const navigate = useNavigate();
  const { userId: targetUserId } = useParams();

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  /* ---------------- Video Binding ---------------- */
  useEffect(() => {
  if (localRef.current && webrtcStore.localStream) {
    localRef.current.srcObject = webrtcStore.localStream;
  }
}, [webrtcStore.localStream]);

useEffect(() => {
  if (remoteRef.current && webrtcStore.remoteStream) {
    remoteRef.current.srcObject = webrtcStore.remoteStream;
  }
}, [webrtcStore.remoteStream]);


  /* ---------------- Controls ---------------- */
  const toggleAudio = () => {
    webrtcStore.localStream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setAudioOn(prev => !prev);
  };

  const toggleVideo = () => {
    webrtcStore.localStream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setVideoOn(prev => !prev);
  };

  const endCall = () => {
    const socket = getSocket();
    socket.emit("end-call", { targetUserId });

    cleanupWebRTC();
    navigate("/");
  };

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => cleanupWebRTC();
  }, []);

  return (
      <div className="h-full flex flex-col items-center justify-center bg-black">
      <div className="flex gap-4 w-full justify-center">
        <div className="aspect-video w-1/3 bg-black rounded overflow-hidden">
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="aspect-video w-1/3 bg-black rounded overflow-hidden">
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <button onClick={toggleAudio} className="px-4 py-2 rounded bg-gray-700">
          {audioOn ? "Mute" : "Unmute"}
        </button>
        <button onClick={toggleVideo} className="px-4 py-2 rounded bg-gray-700">
          {videoOn ? "Video Off" : "Video On"}
        </button>
        <button onClick={endCall} className="px-4 py-2 rounded bg-red-700">
          End Call
        </button>
      </div>
    </div>
  );
}
