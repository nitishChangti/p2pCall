import {
  socketConnected,
  socketDisconnected,
} from "../store/socketSlice";

export const registerSocketListeners = (socket, dispatch) => {
  socket.on("connect", () => {
    dispatch(socketConnected(socket.id));
  });

  socket.on("disconnect", () => {
    dispatch(socketDisconnected());
  });
};
