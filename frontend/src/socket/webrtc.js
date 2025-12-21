import { getSocket } from "./socketClient";
import { webrtcStore } from "./webrtcStore";

/* -------------------------------------------------- */
/* MEDIA                                               */
/* -------------------------------------------------- */
let preparingMedia = false;

export async function prepareMedia() {
  if (webrtcStore.localStream || preparingMedia) return;

  preparingMedia = true;
  try {
    webrtcStore.localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, frameRate: 30 },
      audio: true,
    });
  } finally {
    preparingMedia = false;
  }
}

/* -------------------------------------------------- */
/* CALLER                                              */
/* -------------------------------------------------- */
export async function startCallerWebRTC(receiverId) {
  if (webrtcStore.pc || !webrtcStore.localStream) return;

  const socket = getSocket();
  const pc = createPeerConnection(receiverId);

  webrtcStore.pc = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("webrtc-offer", { receiverId, offer });
}

/* -------------------------------------------------- */
/* RECEIVER                                            */
/* -------------------------------------------------- */
export async function startReceiverWebRTC(offer, callerId) {
  if (webrtcStore.pc || !webrtcStore.localStream) return;

  const socket = getSocket();
  const pc = createPeerConnection(callerId);

  webrtcStore.pc = pc;

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("webrtc-answer", { callerId, answer });
}

/* -------------------------------------------------- */
/* PEER CONNECTION                                     */
/* -------------------------------------------------- */
function createPeerConnection(targetUserId) {
  const socket = getSocket();

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

  pc.oniceconnectionstatechange = () => {
    console.log("ICE STATE:", pc.iceConnectionState);
  };

  webrtcStore.localStream.getTracks().forEach((track) => {
    pc.addTrack(track, webrtcStore.localStream);
  });

  pc.ontrack = (event) => {
    console.log("🎥 Remote stream received");

    const remoteStream = event.streams[0];
    webrtcStore.remoteStream = remoteStream;

    const video = document.getElementById("remote-video");
    if (video && video.srcObject !== remoteStream) {
      video.srcObject = remoteStream;
    }
  };

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
/* CLEANUP                                             */
/* -------------------------------------------------- */
export function cleanupWebRTC() {
  if (webrtcStore.pc) {
    webrtcStore.pc.close();
    webrtcStore.pc = null;
  }

  if (webrtcStore.localStream) {
    webrtcStore.localStream.getTracks().forEach((t) => t.stop());
    webrtcStore.localStream = null;
  }

  webrtcStore.remoteStream = null;
}
