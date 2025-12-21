import { useEffect, useState } from "react";
import { prepareMedia } from "../socket/webrtc";
import CallView from "./CallView";

export default function CallPage() {
  const [ready, setReady] = useState(false);

  const startCall = async () => {
    await prepareMedia();   // ✅ SAFE HERE
    setReady(true);
  };

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
