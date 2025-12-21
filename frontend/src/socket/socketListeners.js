import {
  socketConnected,
  socketDisconnected,
} from "../store/socketSlice";

import {
  showIncomingCall,
  callFailed,
} from "../store/callSlice";

import { getSocket } from "./socketClient";
import { webrtcStore } from "./webrtcStore";
import {startCallerWebRTC,startReceiverWebRTC,cleanupWebRTC} from './webrtc.js'
/* ---------------------------------------------------- */
/* SOCKET LISTENERS                                     */
/* ---------------------------------------------------- */
let pendingCandidates = []; // ✅ HERE
export const registerSocketListeners = (socket, dispatch) => {
  socket.on("connect", () => {
    dispatch(socketConnected(socket.id));
     console.log("🟢 SOCKET CONNECTED:", socket.id);
  });
socket.on("connect_error", (err) => {
  console.log("🔴 SOCKET CONNECT ERROR:", err.message);
});
  socket.on("disconnect", () => {
    cleanupWebRTC();
    dispatch(socketDisconnected());
  });

  socket.on("incoming-call", (data) => {
    dispatch(showIncomingCall(data));
    console.log('receiver user receieved a incoming call',data);
  });

  socket.on("user-offline", () => {
    cleanupWebRTC();
    dispatch(callFailed());
  });

 socket.on("call-accepted", async ({ receiverId }) => {
  // ONLY signaling
  await startCallerWebRTC(receiverId);
    console.log('receiver user receieved a incoming call accepted',receiverId);
});


  socket.on("call-rejected", () => {
    cleanupWebRTC();
    dispatch(callFailed());
    console.log('call rejected');
  });

  socket.on("webrtc-offer", async ({ offer, callerId }) => {
  // ONLY signaling
  await startReceiverWebRTC(offer, callerId);
  console.log('wenrtc offer',offer,"callerId",callerId);
});

  socket.on("webrtc-answer", async ({ answer }) => {
    if (webrtcStore.pc) {
      await webrtcStore.pc.setRemoteDescription(answer);
      console.log('webrtc ans',answer);
    }
  });

  socket.on("ice-candidate", async ({ candidate }) => {
  if (!webrtcStore.pc) {
    pendingCandidates.push(candidate);
    console.log('candidate pushed to pendingcandidate');
    return;
  }
  await webrtcStore.pc.addIceCandidate(candidate);
  console.log('ice candidate',candidate);
});


  socket.on("call-ended", () => {
  cleanupWebRTC();
  console.log('call ended');
});

};
export const flushIceCandidates = async () => {
  if (!webrtcStore.pc) return;

  for (const candidate of pendingCandidates) {
    await webrtcStore.pc.addIceCandidate(candidate);
  }

  pendingCandidates = [];
};
