import { getSocket } from "./socketClient";
import { webrtcStore } from "./webrtcStore";
import {flushIceCandidates} from './socketListeners'
/* -------------------------------------------------- */
/* MEDIA (USER GESTURE ONLY)                           */
/* -------------------------------------------------- */
let pendingCandidates = [];

let preparingMedia = false;

export async function prepareMedia() {
    console.log(`preparemedia is started`);
  if (webrtcStore.localStream) return;
  if (preparingMedia) return;

  preparingMedia = true;

  try {
    webrtcStore.localStream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
  } finally {
    preparingMedia = false;
  }
}

/* -------------------------------------------------- */
/* CALLER                                             */
/* -------------------------------------------------- */

export async function startCallerWebRTC(receiverId) {
  if (webrtcStore.pc) return;
  if (!webrtcStore.localStream) return; // 🔒 hard guard

  const socket = getSocket();
  const stream = webrtcStore.localStream;

  const pc = createPeerConnection(stream, receiverId);
  webrtcStore.pc = pc;
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  flushIceCandidates(); // ✅ ADD THIS
  
  socket.emit("webrtc-offer", { receiverId, offer });
}

/* -------------------------------------------------- */
/* RECEIVER                                           */
/* -------------------------------------------------- */

export async function startReceiverWebRTC(offer, callerId) {
  if (webrtcStore.pc) return;
  if (!webrtcStore.localStream) return; // 🔒 hard guard

  const socket = getSocket();
  const stream = webrtcStore.localStream;

  const pc = createPeerConnection(stream, callerId);
  webrtcStore.pc = pc;
  await pc.setRemoteDescription(offer);
  
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  flushIceCandidates(); // ✅ ADD THIS

  socket.emit("webrtc-answer", { callerId, answer });
}

/* -------------------------------------------------- */
/* PEER CONNECTION                                    */
/* -------------------------------------------------- */

function createPeerConnection(stream, targetUserId) {
  const socket = getSocket();

  // const pc = new RTCPeerConnection({
  //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  // });
  const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
});
  // 🔍 ICE state debug (ADD HERE)
  pc.oniceconnectionstatechange = () => {
    console.log("ICE STATE:", pc.iceConnectionState);
  };
  // Attach local tracks
  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
  });

  // Remote stream
  pc.ontrack = (event) => {
    webrtcStore.remoteStream = event.streams[0];
  };

  // ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        targetUserId,
        candidate: event.candidate,
      });
    }
  };

  return pc;
}

/* -------------------------------------------------- */
/* CLEANUP                                            */
/* -------------------------------------------------- */

export function cleanupWebRTC() {
  if (webrtcStore.pc) {
    webrtcStore.pc.close();
    webrtcStore.pc = null;
  }

  if (webrtcStore.localStream) {
    webrtcStore.localStream.getTracks().forEach(t => t.stop());
    webrtcStore.localStream = null;
  }

  webrtcStore.remoteStream = null;
}
