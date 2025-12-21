import { useEffect, useRef } from "react";
import { webrtcStore } from "../socket/webrtcStore";

export default function CallView() {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
  if (localRef.current && webrtcStore.localStream) {
    localRef.current.srcObject = webrtcStore.localStream;
  }

  if (remoteRef.current && webrtcStore.remoteStream) {
    remoteRef.current.srcObject = webrtcStore.remoteStream;
  }
}, []);


  return (
    <div>
      <video ref={localRef} autoPlay muted playsInline />
      <video ref={remoteRef} autoPlay playsInline />
    </div>
  );
}
