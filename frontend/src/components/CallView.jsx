import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { callEnded, resetCall } from "../store/callSlice";
import { cleanupWebRTC } from "../socket/webrtc";
import { getSocket } from "../socket/socketClient";
import { webrtcStore } from "../socket/webrtcStore";

export default function CallView() {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector(state => state._call);

  // attach local
  useEffect(() => {
    if (localRef.current && webrtcStore.localStream) {
      localRef.current.srcObject = webrtcStore.localStream;
    }
  }, []);

  // attach remote (polling because store is non-reactive)
  useEffect(() => {
    const i = setInterval(() => {
      if (
        remoteRef.current &&
        webrtcStore.remoteStream &&
        remoteRef.current.srcObject !== webrtcStore.remoteStream
      ) {
        remoteRef.current.srcObject = webrtcStore.remoteStream;
      }
    }, 100);

    return () => clearInterval(i);
  }, []);

  // redirect BOTH sides
  useEffect(() => {
    if (status === "ended") {
      navigate("/video-request");
      dispatch(resetCall());
    }
  }, [status, navigate, dispatch]);

  const endCall = () => {
    const socket = getSocket();

    if (webrtcStore.peerId) {
      socket.emit("call-ended", {
        targetUserId: webrtcStore.peerId,
      });
    }

    cleanupWebRTC();
    dispatch(callEnded()); // ✅ THIS FIXES REDIRECT FOR CALLER
  };

  return (
    <>
      <video ref={remoteRef} autoPlay playsInline />
      <video ref={localRef} autoPlay muted playsInline />
      <button onClick={endCall}>End</button>
    </>
  );
}
