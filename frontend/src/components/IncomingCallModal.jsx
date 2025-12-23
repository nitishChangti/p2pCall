import { useDispatch, useSelector } from "react-redux";
import {
  callAccepted,
  callRejected,
  clearIncomingCall,
} from "../store/callSlice";
import { getSocket } from "../socket/socketClient";
import { prepareMedia } from "../socket/webrtc";
import { useNavigate } from "react-router-dom";
import { ClockFading } from "lucide-react";
export default function IncomingCallModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { incomingCall, callStatus } = useSelector((state) => state._call);

  // 🚫 No call → render nothing
  if (callStatus !== "ringing" || !incomingCall) return null;

  const handleAccept = async() => {
    const socket = getSocket();
     const prepare=  await prepareMedia();   // ✅ user click
     console.log('prepare is',prepare);

    socket.emit("accept-call", {
      callerId: incomingCall.callerId,
    });
    // alert('receiver is accepted the call')
    console.log(`preparemedia is executed`);
      navigate(`/call/${incomingCall.callerId}`);
     // ✅ Update receiver UI immediately
    dispatch(callAccepted());
    dispatch(clearIncomingCall());

     // 3️⃣ Delay Redux changes to preserve gesture context
    // setTimeout(() => {
    //     dispatch(callAccepted());
    //     dispatch(clearIncomingCall());
    // }, 0);
  };

  const handleReject = () => {
    const socket = getSocket();

    socket.emit("reject-call", {
      callerId: incomingCall.callerId,
    });
    // alert('receiver is rejected the call')

    dispatch(callRejected());
    dispatch(clearIncomingCall());
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-lg w-80 text-center">
        <h2 className="text-lg font-semibold mb-2">Incoming Call</h2>

        <p className="text-sm text-slate-400 mb-4">
          Caller ID: {incomingCall.callerId}
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="flex-1 bg-green-600 py-2 rounded"
          >
            Accept
          </button>

          <button
            onClick={handleReject}
            className="flex-1 bg-red-600 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
