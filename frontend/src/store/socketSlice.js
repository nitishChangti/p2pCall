import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    isConnected: false,
    socketId: null,
  },
  reducers: {
    socketConnected(state, action) {
      state.isConnected = true;
      state.socketId = action.payload;
    },
    socketDisconnected(state) {
      state.isConnected = false;
      state.socketId = null;
    },
  },
});

export const {
  socketConnected,
  socketDisconnected,
} = socketSlice.actions;

export default socketSlice.reducer;
