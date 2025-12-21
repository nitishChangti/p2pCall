import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
  name: "call",
  initialState: {
    incomingCall: null,   // { callerId, callType }
    callStatus: "idle",   // idle | ringing | in-call | rejected
  },
  reducers: {
    showIncomingCall(state, action) {
      state.incomingCall = action.payload;
      state.callStatus = "ringing";
    },
    clearIncomingCall(state) {
      state.incomingCall = null;
      state.callStatus = "idle";
    },
    callAccepted(state) {
      state.callStatus = "in-call";
    },
    callRejected(state) {
      state.incomingCall = null;
      state.callStatus = "rejected";
    },
    callFailed(state) {
      state.callStatus = "idle";
    },
  },
});

export const {
  showIncomingCall,
  clearIncomingCall,
  callAccepted,
  callRejected,
  callFailed,
} = callSlice.actions;

export default callSlice.reducer;
