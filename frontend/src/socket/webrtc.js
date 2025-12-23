import { getSocket } from "./socketClient";
import { webrtcStore } from "./webrtcStore";

/* ---------------- MEDIA ---------------- */

let preparingMedia = false;

// Initial media (camera + mic)
export async function prepareMedia(facingMode = "user") {
  if (preparingMedia) return webrtcStore.localStream;
  preparingMedia = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: facingMode } },
      audio: true,
    });

    // 🔍 DEBUG 1
    // alert(
    //   "[prepareMedia]\n" +
    //   "videoTracks=" + stream.getVideoTracks().length +
    //   "\n audioTracks=" + stream.getAudioTracks().length +
    //   "\n facingMode=" + facingMode
    // );

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
// alert(`webrtcStore.pc`,webrtcStore.pc,'\n',`!webrtcStore.localStream`,!webrtcStore.localStream)
  webrtcStore.peerId = receiverId;
  const pc = createPeerConnection(receiverId);
  // alert('pc is',pc);
  webrtcStore.pc = pc;

  const offer = await pc.createOffer();
  // alert('offer is ',offer);
  await pc.setLocalDescription(offer);

  // alert("[caller] offer created and set");

  getSocket().emit("webrtc-offer", { receiverId, offer });
  // alert("[caller] offer created and sent");

}

/* ---------------- RECEIVER ---------------- */

export async function startReceiverWebRTC(offer, callerId) {
  if (webrtcStore.pc || !webrtcStore.localStream) return;
// alert(`webrtcStore.pc`,webrtcStore.pc,'\n',`!webrtcStore.localStream`,!webrtcStore.localStream)
  webrtcStore.peerId = callerId;
  const pc = createPeerConnection(callerId);
  // alert('pc is',pc);
  webrtcStore.pc = pc;

  await pc.setRemoteDescription(offer);
  // alert("[receiver] remote description set");

  const answer = await pc.createAnswer();
  //  alert('answer is ',answer);
  await pc.setLocalDescription(answer);

  // alert("[receiver] answer created and set");

  getSocket().emit("webrtc-answer", { callerId, answer });
  // alert("[receiver] answer created and sent");

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
  // alert('pc is',pc);
  // add local tracks
  webrtcStore.localStream.getTracks().forEach(track => {
    pc.addTrack(track, webrtcStore.localStream);
  });

  // 🔍 DEBUG 2
  // alert(
  //   "[createPeerConnection]\n" +
  //   "senders=" + pc.getSenders().length +
  //   "\n senderKinds=" +
  //   pc.getSenders().map(s => s.track?.kind).join(",")
  // );

  // remote stream
  const remoteStream = new MediaStream();
  webrtcStore.remoteStream = remoteStream;
  // alert('remotestream',remoteStream)
  pc.ontrack = (e) => {
    // 🔍 DEBUG 3 (MOST IMPORTANT)
    // alert(
    //   "[ontrack fired]\n" +
    //   "kind=" + e.track.kind +
    //   "\n streams=" + e.streams.length +
    //   "\n tracksInStream=" + e.streams[0].getTracks().length
    // );

    e.streams[0].getTracks().forEach(track => {
      if (!remoteStream.getTracks().includes(track)) {
        remoteStream.addTrack(track);
      }
    });

    // 🔍 DEBUG 4
    // alert(
    //   "[remoteStream status]\n" +
    //   "videoTracks=" + remoteStream.getVideoTracks().length +
    //   "\n audioTracks=" + remoteStream.getAudioTracks().length
    // );
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("ice-candidate", {
        targetUserId,
        candidate: e.candidate,
      });
    }
  };
  // alert('return pc is',pc)
  return pc;
}

/* ---------------- CAMERA SWITCH ---------------- */

export async function switchCamera() {
  if (!webrtcStore.pc || !webrtcStore.localStream) return null;

  // alert("[switchCamera] called");

  const newFacingMode =
    webrtcStore.currentFacingMode === "user"
      ? "environment"
      : "user";
  // alert('newfacingMode',newFacingMode)
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { exact: newFacingMode } },
    audio: false,
  });
  // alert('stream ',stream);
  console.log('stream ',stream);
  const newVideoTrack = stream.getVideoTracks()[0];
// alert('newvideotrack',newVideoTrack)
console.log('newvideotrack',newVideoTrack)
  const sender = webrtcStore.pc
    .getSenders()
    .find(s => s.track && s.track.kind === "video");
      console.log('sender',sender);
      // alert('sender',sender);
  if (sender) {
    await sender.replaceTrack(newVideoTrack);
    // alert("[switchCamera] sender.replaceTrack done");
  }

  const oldVideoTrack = webrtcStore.localStream.getVideoTracks()[0];
  console.log('oldvideo track',oldVideoTrack);
  // alert('oldvideo track',oldVideoTrack);
  if (oldVideoTrack) {
    webrtcStore.localStream.removeTrack(oldVideoTrack);
    oldVideoTrack.stop();
  }

  webrtcStore.localStream.addTrack(newVideoTrack);
  webrtcStore.currentFacingMode = newFacingMode;

  return webrtcStore.localStream;
}

/* ---------------- CLEANUP ---------------- */

export function cleanupWebRTC() {
  // alert("[cleanupWebRTC] called");

  webrtcStore.pc?.close();
  webrtcStore.pc = null;

  webrtcStore.localStream?.getTracks().forEach(t => t.stop());
  webrtcStore.localStream = null;
  webrtcStore.remoteStream = null;
  webrtcStore.peerId = null;
}
