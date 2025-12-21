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

  socket.on("user-offline", () => {
    cleanupWebRTC();
    dispatch(callFailed());
  });

 socket.on("call-accepted", async ({ receiverId }) => {
  // ONLY signaling
  await startCallerWebRTC(receiverId);
});


  socket.on("call-rejected", () => {
    cleanupWebRTC();
    dispatch(callFailed());
  });

  socket.on("webrtc-offer", async ({ offer, callerId }) => {
  // ONLY signaling
  await startReceiverWebRTC(offer, callerId);
});

  socket.on("webrtc-answer", async ({ answer }) => {
    if (webrtcStore.pc) {
      await webrtcStore.pc.setRemoteDescription(answer);
    }
  });

  socket.on("ice-candidate", async ({ candidate }) => {
    if (webrtcStore.pc && candidate) {
      await webrtcStore.pc.addIceCandidate(candidate);
    }
  });
};
