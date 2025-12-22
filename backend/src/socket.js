import { Server } from "socket.io";

let io;

// ✅ userId → socketId map
const userSocketMap = new Map();
export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://p2pcall-sigma.vercel.app","https://xzq1pm1p-5173.inc1.devtunnels.ms"], // your frontend (Vite, React, etc.)
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
      const userId = socket.handshake.auth?.userId;
      console.log("🔐 SOCKET AUTH USERID:", userId);

    if(!userId){
      console.log("❌ Socket connected without userId");
      socket.disconnect();
      return;
    }

      // ✅ Map userId → socketId
    userSocketMap.set(userId, socket.id);
    console.log("🗺️ CURRENT SOCKET MAP:", [...userSocketMap.entries()]);

        console.log(
      `✅ User connected | userId=${userId} | socketId=${socket.id}`
    );
    socket.on('new-call',({callerId,receiverId,callType})=>{
       console.log("📞 New call request:", {
        callerId,
        receiverId,
        callType,
      });
      const receiverSocketId = userSocketMap.get(receiverId);
      console.log(`receiver socket id `,receiverSocketId);
      if(receiverSocketId){
        io.to(receiverSocketId).emit('incoming-call',{callerId,callType})
        console.log('this is after the incoming -call sended to user receiever');
      }
      else{
        socket.emit('user-offline',{receiverId})
      }

    })

     /* -------------------- ACCEPT CALL -------------------- */
    socket.on("accept-call", ({ callerId }) => {
      console.log("✅ Call accepted by:", userId);

      const callerSocketId = userSocketMap.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-accepted", {
          receiverId: userId,
        });
        console.log('call acception is sended to the user a', callerId);
      }
    });

    /* -------------------- REJECT CALL -------------------- */
    socket.on("reject-call", ({ callerId }) => {
      console.log("❌ Call rejected by:", userId);

      const callerSocketId = userSocketMap.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit("call-rejected", {
          receiverId: userId,
        });
      }
    });

    /* ---------------------- webrtc-offer ------------------ */
    socket.on('webrtc-offer',({receiverId,offer})=>{
      console.log(`user webrtc offer req on server`,receiverId,offer);
      const receiverSocketId = userSocketMap.get(receiverId);
      if(receiverSocketId){
        io.to(receiverSocketId).emit('webrtc-offer',{
             offer,
              callerId: userId, // sender is caller
        })
        console.log(`webrtc offer req is sended from backend to receiver`);
      }
      else{
           console.log("❌ Receiver socket not found for offer");
      }
    })


    /* ---------------------- WEBRTC ANSWER ------------------ */
socket.on("webrtc-answer", ({ callerId, answer }) => {
  console.log("📡 WebRTC answer received on server",callerId,answer);

  const callerSocketId = userSocketMap.get(callerId);

  if (callerSocketId) {
    io.to(callerSocketId).emit("webrtc-answer", {
      answer,
      receiverId: userId,
    });
  } else {
    console.log("❌ Caller socket not found for answer");
  }
});

  /* ---------------------- ICE CANDIDATE ------------------ */
socket.on("ice-candidate", ({ targetUserId, candidate }) => {
  const targetSocketId = userSocketMap.get(targetUserId);
  console.log('ice candidate is',targetSocketId,candidate);
  if (targetSocketId) {
    io.to(targetSocketId).emit("ice-candidate", {
      candidate,
    });
    console.log('ice candidate is sended to given user',targetSocketId,candidate);
  } else {
    console.log("❌ Target socket not found for ICE");
  }
});

  /* -------------------- Call Ended --------------- */
  socket.on("call-ended", ({ targetUserId }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    console.log(targetUserId,'call ended is',targetSocketId);

  if (targetSocketId) {
    io.to(targetSocketId).emit("call-ended");
    console.log('call ended socket sended to the particular user');
  }
});



      // 🔌 Disconnect
    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
      console.log(`❌ User disconnected | userId=${userId}`);
    });
  });

}
