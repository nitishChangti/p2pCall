import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCcw,
} from "lucide-react";

import { webrtcStore } from "../socket/webrtcStore";
import {
  prepareMedia,
  cleanupWebRTC,
  switchCamera,
  startCallerWebRTC,
} from "../socket/webrtc";
import { getSocket } from "../socket/socketClient";
import { resetCall, callEnded } from "../store/callSlice";

const isMobile =navigator.maxTouchPoints > 1;
console.log('device is',isMobile);
export default function CallView() {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const { userId: routeUserId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { status } = useSelector((state) => state._call);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------------- ROLE ---------------- */
    const isCaller = routeUserId !== user._id;
    console.log('iscaller',isCaller);
  /* ---------------- UI STATE ---------------- */
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [warmingUp, setWarmingUp] = useState(true);

   // ✅ ADD THIS EFFECT HERE
    useEffect(() => {
    let active = true;

    const init = async () => {
      const stream =
        webrtcStore.localStream || (await prepareMedia());

      if (!active) return;

      // 🔥 ALWAYS attach local preview on mount
      if (localRef.current) {
        localRef.current.srcObject = stream;
        await localRef.current.play().catch(() => {});
      }

      setWarmingUp(false);
    };

    init();

    return () => {
      active = false;
    };
  }, [isCaller]);
  /* ---------------- SET PEER ID ---------------- */
  useEffect(() => {
    webrtcStore.peerId = routeUserId;
  }, [routeUserId]);

  /* ---------------- ENSURE MEDIA + START OFFER ---------------- */
  // useEffect(() => {
  //   let cancelled = false;

  //   (async () => {
  //     // 🔥 ALWAYS ENSURE MEDIA EXISTS
  //     if (!webrtcStore.localStream) {
  //       await prepareMedia();
  //     }

  //     if (cancelled) return;

  //     // Attach local preview
  //     if (localRef.current) {
  //       localRef.current.srcObject = webrtcStore.localStream;
  //     }

  //     // End warm-up only after media is ready
  //     setWarmingUp(false);

  //     // 🔥 ONLY CALLER CREATES OFFER
  //     if (isCaller && !webrtcStore.pc && webrtcStore.peerId) {
  //       await startCallerWebRTC(webrtcStore.peerId);
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [isCaller]);
console.log("localStream now:", webrtcStore.localStream);

 useEffect(() => {
  console.log('here self camera is beginning');
  let mounted = true;

  (async () => {
    const stream =
      webrtcStore.localStream || (await prepareMedia());
    console.log('stream is',stream);
    // if (!mounted) return;
    // if (!localRef.current) return;
       if (!mounted){
        console.log(`mounted false`);
        return
       }
    if (!localRef.current) {
      console.log(`localRef.cur`);
      return;
      }
    console.log("🎥 Attaching self camera");

    localRef.current.srcObject = stream;
    localRef.current.muted = true;
    localRef.current.playsInline = true;
    localRef.current.play().catch(() => {});
    
    setWarmingUp(false);
  })();

  return () => {
    mounted = false;
  };
}, []);


  /* ---------------- ATTACH REMOTE STREAM ---------------- */
  useEffect(() => {
    const i = setInterval(() => {
      if (
        remoteRef.current &&
        webrtcStore.remoteStream &&
        remoteRef.current.srcObject !== webrtcStore.remoteStream
      ) {
        remoteRef.current.srcObject = webrtcStore.remoteStream;
        remoteRef.current.play().catch(() => {});
        clearInterval(i);
      }
    }, 100);

    return () => clearInterval(i);
  }, []);

  /* ---------------- CALL END REDIRECT ---------------- */
  useEffect(() => {
    if (status === "ended") {
      navigate("/video-request");
      dispatch(resetCall());
    }
  }, [status, navigate, dispatch]);

  /* ---------------- CLEANUP ---------------- */
  // useEffect(() => {
  //   return () => cleanupWebRTC();
  // }, []);

  /* ---------------- MIC ---------------- */
  const toggleMic = () => {
  setMicOn(prev => {
    const pc = webrtcStore.pc;
    if (!pc) return prev;

    const audioSender = pc
      .getSenders()
      .find(sender => sender.track?.kind === "audio");

    if (audioSender && audioSender.track) {
      audioSender.track.enabled = !prev;
      console.log(
        "🎙 Mic enabled:",
        audioSender.track.enabled
      );
    }

    return !prev;
  });
};


  /* ---------------- CAMERA ---------------- */
  const toggleCamera = () => {
    setCamOn((prev) => {
      const pc = webrtcStore.pc;
      const stream = webrtcStore.localStream;
      if (!pc || !stream) return prev;

      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      const track = stream.getVideoTracks()[0];
      if (!sender || !track) return prev;

      track.enabled = !prev;
      sender.replaceTrack(track);

      return !prev;
    });
  };

  /* ---------------- SWITCH CAMERA ---------------- */
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

  /* ---------------- END CALL ---------------- */
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

  /* ---------------- WARM-UP UI ---------------- */
  // if (warmingUp) {
  //   return (
  //     <div className="fixed inset-0 bg-black flex items-center justify-center">
  //       <div className="text-center text-white space-y-3">
  //         <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
  //         <p className="text-sm opacity-80">Preparing camera & mic…</p>
  //       </div>
  //     </div>
  //   );
  // }

  /* ---------------- CALL UI ---------------- */
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

        {/* Local preview */}
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className={`absolute bottom-24 right-4 w-40 h-44 rounded-lg object-cover border border-white shadow-lg transition-opacity ${
            camOn ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Controls */}
        <div className="absolute bottom-0 w-full flex justify-center gap-6 py-4 bg-black/60">
          {isMobile && (
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
