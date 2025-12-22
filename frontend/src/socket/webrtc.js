import { getSocket } from "./socketClient";
import { webrtcStore } from "./webrtcStore";

/* ---------------- MEDIA ---------------- */

let preparingMedia = false;

export async function prepareMedia(facingMode = "user") {
  if (preparingMedia) return webrtcStore.localStream;
  preparingMedia = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: true,
    });

    webrtcStore.localStream = stream;
    webrtcStore.currentFacingMode = facingMode;
    return stream;
  } finally {
    preparingMedia = false;
  }
}

/* ---------------- CALLER ---------------- */

export async function startCallerWebRTC(receiverId) {
  if (webrtcStore.pc || !webrtcStore.localStream) return;

  webrtcStore.peerId = receiverId;
  const pc = createPeerConnection(receiverId);
  webrtcStore.pc = pc;

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  getSocket().emit("webrtc-offer", { receiverId, offer });
}

/* ---------------- RECEIVER ---------------- */

export async function startReceiverWebRTC(offer, callerId) {
  if (webrtcStore.pc || !webrtcStore.localStream) return;

  webrtcStore.peerId = callerId;
  const pc = createPeerConnection(callerId);
  webrtcStore.pc = pc;

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  getSocket().emit("webrtc-answer", { callerId, answer });
}

/* ---------------- PEER CONNECTION ---------------- */

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

  // add local tracks
  webrtcStore.localStream.getTracks().forEach(track => {
    pc.addTrack(track, webrtcStore.localStream);
  });

  // ✅ FIX: merge remote tracks
  const remoteStream = new MediaStream();
  webrtcStore.remoteStream = remoteStream;

  pc.ontrack = (e) => {
    e.streams[0].getTracks().forEach(track => {
      if (!remoteStream.getTracks().includes(track)) {
        remoteStream.addTrack(track);
      }
    });
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("ice-candidate", {
        targetUserId,
        candidate: e.candidate,
      });
    }
  };

  return pc;
}

/* ---------------- CAMERA SWITCH ---------------- */

export async function switchCamera() {
  if (!webrtcStore.pc) return null;

  const newFacingMode =
    webrtcStore.currentFacingMode === "user"
      ? "environment"
      : "user";

  const newStream = await prepareMedia(newFacingMode);
  const newVideoTrack = newStream.getVideoTracks()[0];

  const sender = webrtcStore.pc
    .getSenders()
    .find(s => s.track?.kind === "video");

  if (sender) {
    await sender.replaceTrack(newVideoTrack);
  }

  // ✅ IMPORTANT
  webrtcStore.localStream = newStream;

  return newStream;
}

/* ---------------- CLEANUP ---------------- */

export function cleanupWebRTC() {
  webrtcStore.pc?.close();
  webrtcStore.pc = null;

  webrtcStore.localStream?.getTracks().forEach(t => t.stop());
  webrtcStore.localStream = null;
  webrtcStore.remoteStream = null;
  webrtcStore.peerId = null;
}
