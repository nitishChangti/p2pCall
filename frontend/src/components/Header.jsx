import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authFailure } from "../store/authSlice";
import { authService } from "../service/authService";
// import { disconnectSocket } from "../socketClient";
import { useNavigate } from "react-router-dom";
export default function Header() {
  const navigate = useNavigate()
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  console.log(isAuthenticated,user);
  // const hideHeaderOn = ["/call"];
  // if (hideHeaderOn.some((path) => location.pathname.startsWith(path))) {
  //   return null;
  // }

  const handleLogout = async () => {
    try {
      const res = await authService.logOut(); // backend clears cookie
      console.log(res);
      if(res.status === 200){
           dispatch(authFailure());
      navigate("/");
      }

          } catch (err) {
      console.error("Logout failed", err);
    } finally {
      // disconnectSocket();
      dispatch(authFailure());
      navigate("/");
    }
  };

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white">
          P2P<span className="text-blue-500">Call</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm">
          {!isAuthenticated ? (
            <>
              {location.pathname !== "/login" && (
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white transition"
                >
                  Sign in
                </Link>
              )}

              {location.pathname !== "/signup" && (
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 transition"
                >
                  Sign up
                </Link>
              )}
            </>
          ) : (
            <>
              <span className="text-slate-400">
                Hi, {user?.name}
              </span>

              <Link
                to="/profile"
                className="text-slate-300 hover:text-white transition"
              >
                Profile
              </Link>

              <Link
                to="/video-request"
                className="px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 transition"
              >
                New Call
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
