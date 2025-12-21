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
    const interval = setInterval(() => {
      if (localRef.current && webrtcStore.localStream) {
        localRef.current.srcObject = webrtcStore.localStream;
      }

      if (remoteRef.current && webrtcStore.remoteStream) {
        remoteRef.current.srcObject = webrtcStore.remoteStream;
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

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
      {/* Videos */}
      <div className="flex gap-4 w-full justify-center">
        <video ref={localRef} autoPlay muted playsInline className="w-1/3 rounded" />
        <video ref={remoteRef} autoPlay playsInline className="w-1/3 rounded" />
      </div>

      {/* Controls */}
      <div className="flex gap-6 mt-6">
        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded ${
            audioOn ? "bg-gray-700" : "bg-red-600"
          }`}
        >
          {audioOn ? "Mute" : "Unmute"}
        </button>

        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded ${
            videoOn ? "bg-gray-700" : "bg-red-600"
          }`}
        >
          {videoOn ? "Video Off" : "Video On"}
        </button>

        <button
          onClick={endCall}
          className="px-4 py-2 rounded bg-red-700"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
