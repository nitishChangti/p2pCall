import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/**
 * AuthLayout (Auth Guard)
 *
 * @param {ReactNode} children
 * @param {boolean} authentication - true = protected route, false = guest route
 */
export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Protected route but user NOT logged in
    if (authentication && !isAuthenticated) {
      navigate("/login", { replace: true });
    }

    // Guest route but user IS logged in
    if (!authentication && isAuthenticated) {
      navigate("/", { replace: true });
    }

    setLoading(false);
  }, [authentication, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Checking authentication…
      </div>
    );
  }

  return <>{children}</>;
}
