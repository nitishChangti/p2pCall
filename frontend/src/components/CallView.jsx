import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mic, MicOff, Video, VideoOff, PhoneOff, RefreshCcw } from "lucide-react";

import { webrtcStore } from "../socket/webrtcStore";
import { cleanupWebRTC, switchCamera } from "../socket/webrtc";
import { getSocket } from "../socket/socketClient";
import { resetCall } from "../store/callSlice";

const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

export default function CallView() {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { status } = useSelector((state) => state._call);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [switching, setSwitching] = useState(false);

  /* ---------------- Attach local stream ---------------- */
  useEffect(() => {
    if (localRef.current && webrtcStore.localStream) {
      localRef.current.srcObject = webrtcStore.localStream;
    }
  }, []);

  /* ---------------- Attach remote stream ---------------- */
  useEffect(() => {
    if (remoteRef.current && webrtcStore.remoteStream) {
      remoteRef.current.srcObject = webrtcStore.remoteStream;
    }
  }, [webrtcStore.remoteStream]);

  /* ---------------- Handle call end (Redux-driven) ---------------- */
  useEffect(() => {
    if (status === "ended") {
      navigate("/video-request");
      dispatch(resetCall());
    }
  }, [status, navigate, dispatch]);

  /* ---------------- Cleanup on unmount ---------------- */
  useEffect(() => {
    return () => cleanupWebRTC();
  }, []);

  /* ---------------- Mic toggle ---------------- */
  const toggleMic = () => {
    webrtcStore.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  /* ---------------- Camera toggle ---------------- */
  const toggleCamera = () => {
    webrtcStore.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    });
  };

  /* ---------------- Switch camera (mobile-safe) ---------------- */
  const handleSwitchCamera = async () => {
    if (switching) return;
    setSwitching(true);

    try {
      const newStream = await switchCamera();
      if (newStream && localRef.current) {
        localRef.current.srcObject = newStream;
      }
    } finally {
      setSwitching(false);
    }
  };

  /* ---------------- End call ---------------- */
  const endCall = () => {
    const socket = getSocket();

    if (webrtcStore.peerId) {
      socket.emit("call-ended", {
        targetUserId: webrtcStore.peerId,
      });
    }

    cleanupWebRTC();
    dispatch(resetCall());
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Video container */}
      <div
        className="
          relative
          w-full h-full
          md:w-[60%] md:h-[90%]
          max-w-5xl
          bg-black
          overflow-hidden
          rounded-none md:rounded-xl
        "
      >
        {/* Remote video */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Local preview */}
        {camOn && (
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="absolute bottom-24 right-4 w-40 h-28 rounded-lg object-cover border border-white shadow-lg"
          />
        )}

        {/* Controls */}
        <div className="absolute bottom-0 w-full flex justify-center gap-6 py-4 bg-black/60">
          {isMobile && (
            <button
              onClick={handleSwitchCamera}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
            >
              <RefreshCcw className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition ${
              micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {micOn ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition ${
              camOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {camOn ? <Video /> : <VideoOff />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-700 hover:bg-red-800 transition"
          >
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  );
}
