import { socketConnected, socketDisconnected } from "../store/socketSlice";
import { showIncomingCall, callFailed } from "../store/callSlice";
import { prepareMedia } from "./webrtc";
import { webrtcStore } from "./webrtcStore";
import {
  startCallerWebRTC,
  startReceiverWebRTC,
  cleanupWebRTC,
} from "./webrtc";

/* ---------------------------------------------------- */
/* ICE QUEUE (SINGLE SOURCE OF TRUTH)                   */
/* ---------------------------------------------------- */
let pendingCandidates = [];

export const flushIceCandidates = async () => {
  if (!webrtcStore.pc) return;

  for (const candidate of pendingCandidates) {
    await webrtcStore.pc.addIceCandidate(candidate);
  }

  pendingCandidates = [];
};

/* ---------------------------------------------------- */
/* SOCKET LISTENERS                                     */
/* ---------------------------------------------------- */
export const registerSocketListeners = (socket, dispatch) => {
  socket.on("connect", () => {
    dispatch(socketConnected(socket.id));
    console.log("🟢 Socket connected:", socket.id);
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

    // ✅ Remote SDP set → now ICE is safe
    await flushIceCandidates();
  });

  socket.on("webrtc-answer", async ({ answer }) => {
    if (!webrtcStore.pc) return;

    await webrtcStore.pc.setRemoteDescription(answer);

    // ✅ Remote SDP set → now ICE is safe
    await flushIceCandidates();
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (!webrtcStore.pc) {
      pendingCandidates.push(candidate);
      return;
    }

    await webrtcStore.pc.addIceCandidate(candidate);
  });

  socket.on("call-ended", () => {
    cleanupWebRTC();
  });
};
