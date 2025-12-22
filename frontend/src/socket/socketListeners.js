import { socketConnected, socketDisconnected } from "../store/socketSlice";
import { showIncomingCall, callFailed, callEnded } from "../store/callSlice";
import { prepareMedia, startCallerWebRTC, startReceiverWebRTC, cleanupWebRTC } from "./webrtc";
import { webrtcStore } from "./webrtcStore";

let pendingCandidates = [];

export const flushIceCandidates = async () => {
  if (!webrtcStore.pc) return;
  for (const c of pendingCandidates) {
    await webrtcStore.pc.addIceCandidate(c);
  }
  pendingCandidates = [];
};

export const registerSocketListeners = (socket, dispatch) => {
  socket.on("connect", () => {
    dispatch(socketConnected(socket.id));
  });

  socket.on("disconnect", () => {
    cleanupWebRTC();
    dispatch(socketDisconnected());
  });

  socket.on("incoming-call", (data) => {
    dispatch(showIncomingCall(data));
  });

  socket.on("call-accepted", async ({ receiverId }) => {
    await startCallerWebRTC(receiverId);
  });

  socket.on("call-rejected", () => {
    cleanupWebRTC();
    dispatch(callFailed());
  });

  socket.on("webrtc-offer", async ({ offer, callerId }) => {
    if (!webrtcStore.localStream) {
      await prepareMedia();
    }
    await startReceiverWebRTC(offer, callerId);
    await flushIceCandidates();
  });

  socket.on("webrtc-answer", async ({ answer }) => {
    await webrtcStore.pc?.setRemoteDescription(answer);
    await flushIceCandidates();
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (!webrtcStore.pc) {
      pendingCandidates.push(candidate);
      return;
    }
    await webrtcStore.pc.addIceCandidate(candidate);
  });

  // ✅ BOTH SIDES HANDLE THIS
  socket.on("call-ended", () => {
    cleanupWebRTC();
    dispatch(callEnded());
  });
};
