import './App.css'
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { useDispatch,useSelector } from "react-redux";
import { authSuccess, authFailure } from "./store/authSlice";
import { useEffect,useRef } from 'react';
import { authService } from './service/authService';
 import { connectSocket,disconnectSocket } from "./socket/socketClient";
import { registerSocketListeners } from "./socket/socketListeners";
import { IncomingCallModal } from './components/index';
import axios from "axios";
export default function App() {
  const dispatch = useDispatch();
    const { isAuthenticated,user } = useSelector((state) => state.auth);
    // prevents multiple calls
  const hasFetchedRef = useRef(false);
  
   useEffect(() => {
     if (isAuthenticated) return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        console.log('getcurrentuser',res);
        dispatch(authSuccess({ user: res?.data?.data?.user }));
      } catch (error) {
        dispatch(authFailure(null)); // user not logged in
      }
    };

    fetchUser();
  }, [isAuthenticated,dispatch]);

    // 🔹 2. Connect socket AFTER auth exists
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socket = connectSocket({
      auth: { userId: user._id },
    });

    registerSocketListeners(socket, dispatch);

    console.log("🔌 Socket connected for:", user._id);

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user?._id, dispatch]);


  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />
       {/* 📞 USER RECEIVES CALL HERE (GLOBAL UI) */}
      <IncomingCallModal />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

