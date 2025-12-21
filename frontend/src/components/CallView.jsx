import { useEffect, useRef, useState } from "react";
import { webrtcStore } from "../socket/webrtcStore";
import { cleanupWebRTC } from "../socket/webrtc";
import { getSocket } from "../socket/socketClient";
import { useNavigate, useParams } from "react-router-dom";

export default function CallView() {
  const localRef = useRef(null);
  const navigate = useNavigate();
  const { userId: targetUserId } = useParams();

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    if (localRef.current && webrtcStore.localStream) {
      localRef.current.srcObject = webrtcStore.localStream;
    }
  }, []);

  const toggleAudio = () => {
    webrtcStore.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setAudioOn((v) => !v);
  };

  const toggleVideo = () => {
    webrtcStore.localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setVideoOn((v) => !v);
  };

  const endCall = () => {
    getSocket().emit("end-call", { targetUserId });
    cleanupWebRTC();
    navigate("/");
  };

  useEffect(() => cleanupWebRTC, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-black">
      <div className="flex gap-4 w-full justify-center">
        <div className="aspect-video w-1/3 rounded overflow-hidden">
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="aspect-video w-1/3 rounded overflow-hidden">
          <video
            id="remote-video"
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <button onClick={toggleAudio} className="px-4 py-2 bg-gray-700 rounded">
          {audioOn ? "Mute" : "Unmute"}
        </button>
        <button onClick={toggleVideo} className="px-4 py-2 bg-gray-700 rounded">
          {videoOn ? "Video Off" : "Video On"}
        </button>
        <button onClick={endCall} className="px-4 py-2 bg-red-700 rounded">
          End Call
        </button>
      </div>
    </div>
  );
}
