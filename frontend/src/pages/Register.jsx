import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/register.schema";
import { authStart, authSuccess, authFailure } from "../store/authSlice";
import { authService } from "../service/authService";
export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    dispatch(authStart());
    console.log(data);
    try {
          if(data.password !== data.confirmPassword)  {
        dispatch(authFailure("Passwords do not match"));
        console.error(`enter a matchable password`)
        return ;
      }
      const response = await authService.SignUp(data.name,data.email,data.password);
      
      console.log(response);
      if(response?.status === 201){
        const userData = response?.data?.data?.createdUser
        dispatch(authSuccess({ user: userData }));
        navigate("/");
      }

    } catch(error) {
       console.error("REGISTER ERROR:", error);

  if (error.response) {
    console.error("Backend error:", error.response.data);
  } else {
    console.error("Network error:", error.message);
  }

  dispatch(authFailure("Registration failed"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            P2P<span className="text-blue-500">Call</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Full name
              </label>
              <input
                {...register("name")}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
