import { useEffect, useState } from "react";
import { prepareMedia } from "../socket/webrtc";
import { webrtcStore } from "../socket/webrtcStore";

export default function CallPage() {
  const [ready, setReady] = useState(false);

  const startCall = async () => {
    await prepareMedia();
    setReady(true);
  };

  useEffect(() => {
    if (ready && webrtcStore.pc === null) {
      // WebRTC will auto-start via socket events
    }
  }, [ready]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      {!ready ? (
        <button
          onClick={startCall}
          className="bg-green-600 px-6 py-3 rounded text-white"
        >
          Start Call
        </button>
      ) : (
        <CallView />
      )}
    </div>
  );
}
