import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mic, MicOff, Video, VideoOff, PhoneOff, RefreshCcw } from "lucide-react";

import { webrtcStore } from "../socket/webrtcStore";
import { cleanupWebRTC, switchCamera } from "../socket/webrtc";
import { getSocket } from "../socket/socketClient";
import { resetCall, callEnded } from "../store/callSlice";

export default function CallView() {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state._call);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);

  /* ---------------- Detect if camera can be switched ---------------- */
  useEffect(() => {
  const isHandheld =
    navigator.maxTouchPoints > 1 &&
    /Android|iPhone|iPad/i.test(navigator.userAgent);

  // ❌ Laptop / desktop → never show switch camera
  if (!isHandheld) {
    setCanSwitchCamera(false);
    return;
  }

  // 📱 Mobile / tablet → check if multiple cameras exist
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCanSwitchCamera(videoInputs.length > 1);
  });
}, []);


  /* ---------------- Attach local stream ---------------- */
  useEffect(() => {
    if (localRef.current && webrtcStore.localStream) {
      localRef.current.srcObject = webrtcStore.localStream;
    }
  }, []);

  /* ---------------- Attach remote stream (mobile autoplay-safe) ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        remoteRef.current &&
        webrtcStore.remoteStream &&
        remoteRef.current.srcObject !== webrtcStore.remoteStream
      ) {
        remoteRef.current.srcObject = webrtcStore.remoteStream;
        remoteRef.current.play().catch(() => {});
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- Redirect on call end ---------------- */
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

  /* ---------------- Mic toggle (UI is source of truth) ---------------- */
  const toggleMic = () => {
    setMicOn((prev) => {
      webrtcStore.localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !prev;
      });
      return !prev;
    });
  };

  /* ---------------- Camera toggle (UI is source of truth) ---------------- */
  const toggleCamera = () => {
    setCamOn((prev) => {
      webrtcStore.localStream?.getVideoTracks().forEach((track) => {
        track.enabled = !prev;
      });
      return !prev;
    });
  };

  /* ---------------- Switch camera ---------------- */
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
    dispatch(callEnded());
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full md:w-[60%] md:h-[90%] max-w-5xl bg-black overflow-hidden rounded-none md:rounded-xl">

        {/* Remote video */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Local preview (never unmounted) */}
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className={`absolute bottom-24 right-4 w-40 h-28 rounded-lg object-cover border border-white shadow-lg transition-opacity ${
            camOn ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Controls */}
        <div className="absolute bottom-0 w-full flex justify-center gap-6 py-4 bg-black/60">

          {canSwitchCamera && (
            <button
              onClick={handleSwitchCamera}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600"
            >
              <RefreshCcw />
            </button>
          )}

          <button
            onClick={toggleMic}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            {micOn ? <Mic /> : <MicOff />}
          </button>

          <button
            onClick={toggleCamera}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            {camOn ? <Video /> : <VideoOff />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-700 hover:bg-red-800"
          >
            <PhoneOff />
          </button>
        </div>
      </div>
    </div>
  );
}
