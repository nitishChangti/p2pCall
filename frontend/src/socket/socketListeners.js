import { socketConnected, socketDisconnected } from "../store/socketSlice";
import { showIncomingCall, callFailed,callEnded } from "../store/callSlice";
import { prepareMedia } from "./webrtc";
import { webrtcStore } from "./webrtcStore";
import {
  startCallerWebRTC,
  startReceiverWebRTC,
  cleanupWebRTC,
} from "./webrtc";

/* ---------------------------------------------------- */
/* ICE QUEUE (single source of truth)                   */
/* ---------------------------------------------------- */
let pendingCandidates = [];

export const flushIceCandidates = async () => {
  if (!webrtcStore.pc) return;

  for (const c of pendingCandidates) {
    await webrtcStore.pc.addIceCandidate(c);
  }
  pendingCandidates = [];
};

/* ---------------------------------------------------- */
/* SOCKET LISTENERS                                     */
/* ---------------------------------------------------- */
export const registerSocketListeners = (socket, dispatch) => {
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
    dispatch(socketConnected(socket.id));
  });

  socket.on("disconnect", () => {
    cleanupWebRTC();
    dispatch(socketDisconnected());
  });

  socket.on("incoming-call", (data) => {
    // alert(`incoming call is received from backend to receiver`)
    // console.log(' this is icoming call from backend to receiver');
    dispatch(showIncomingCall(data));
  });

  socket.on("call-accepted", async ({ receiverId }) => {
    // alert(`user accepted a call request`)
    // console.log('user accepted a call request');
    await startCallerWebRTC(receiverId);
  });

  socket.on("call-rejected", () => {
    // alert(`user is rejecteed a call request`)
    // console.log(`user is rejecteed a call request`);
    cleanupWebRTC();
    dispatch(callFailed());
  });

  socket.on("webrtc-offer", async ({ offer, callerId }) => {
    // alert('webrtc -offer is recieved from bakend to receiever',offer,callerId)
    // console.log('webrtc -offer is recieved from bakend to receiever',offer,callerId);
    if (!webrtcStore.localStream) {
      await prepareMedia();
      // console.log(`webrtcStore.localStream does not exists`,webrtcStore.localStream);
      // alert(`webrtcStore.localStream does not exists`,webrtcStore.localStream)
    }
    console.log(`before startReceiverWebrtc`);
    // alert(`before startReceiverWebrtc`)
    await startReceiverWebRTC(offer, callerId);
    // console.log(`after startReceiverWebrtc`);
    // alert(`after startReceiverWebrtc`)
    await flushIceCandidates();
  });

  socket.on("webrtc-answer", async ({ answer }) => {
    if (!webrtcStore.pc) return;
    // alert(`web-answer`,answer)
    await webrtcStore.pc.setRemoteDescription(answer);
    await flushIceCandidates();
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (!webrtcStore.pc) {
      pendingCandidates.push(candidate);
      return;
    }
    await webrtcStore.pc.addIceCandidate(candidate);
    // alert('ice candidate ',candidate)
  });

  socket.on("call-ended", () => {
  console.log("📴 call-ended received on client");
  cleanupWebRTC();
  dispatch(callEnded())
  // alert('call ended')
});

};
