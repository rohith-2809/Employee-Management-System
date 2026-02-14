
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiLock,
  FiMail,
  FiUserPlus,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// --- Main Login Component ---
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      navigate(user.role === "admin" ? "/admindashboard" : "/dashboard");
    }
  }, [navigate]);

  // Clear error when user starts typing again
  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [email, password]);

  // Handle navigation after successful login
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        navigate(user.role === "admin" ? "/admindashboard" : "/dashboard");
      }
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [isSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;
    setError("");
    setIsLoading(true);

    // Get the API URL from environment variables, with a fallback for local development
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      // Use the apiUrl variable in the fetch request
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      setIsSuccess(true);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-white/90 bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900" />
      <div className="absolute inset-0 z-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 flex flex-col lg:flex-row w-full max-w-5xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="w-full lg:w-2/5 p-8 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-block p-3 mb-4 bg-indigo-500/20 rounded-full">
              <FiLock className="text-indigo-400 text-5xl" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Project Guard
            </h1>
            <p className="text-white/60 mt-2 mb-8">
              Secure and seamless task management .
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/signup")}
              className="w-full lg:w-auto text-lg font-semibold text-white bg-transparent border-2 border-white/50 hover:bg-white/10 py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              <FiUserPlus /> Create an Account
            </motion.button>
          </motion.div>
        </div>
        <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-slate-900/50">
          <motion.div
            variants={{ error: { x: [0, -5, 5, -5, 5, 0] } }}
            animate={error ? "error" : ""}
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <SuccessView isLogin={true} />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-8">
                    Sign In
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <FloatingLabelInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      Icon={FiMail}
                      autoComplete="email"
                    />
                    <FloatingLabelInput
                      id="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                      Icon={FiLock}
                      autoComplete="current-password"
                    >
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 hover:text-white/80 z-20"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <FiEye />
                      </button>
                    </FloatingLabelInput>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Forgot password functionality is not yet implemented."
                          )
                        }
                        className="text-sm text-indigo-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/50 py-4 rounded-lg flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Sign In <FiArrowRight />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-center text-sm font-semibold text-red-400 bg-red-500/20 p-3 rounded-lg mt-6"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Child Components ---

const FloatingLabelInput = ({
  id,
  label,
  type,
  value,
  onChange,
  children,
  Icon,
  autoComplete,
}) => (
  <div className="relative w-full">
    {Icon && (
      <Icon className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40 pointer-events-none" />
    )}
    <input
      id={id}
      className={clsx(
        "peer w-full bg-transparent border-2 border-slate-600 rounded-lg p-4 pt-6 text-base text-white/90 focus:outline-none focus:border-indigo-500 placeholder-transparent",
        Icon && "pl-12"
      )}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      required
      autoComplete={autoComplete}
    />
    <label
      htmlFor={id}
      className={clsx(
        "absolute top-4 text-white/40 transition-all duration-200 pointer-events-none",
        Icon ? "left-12" : "left-4",
        "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base",
        "peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-400",
        value && "top-1.5 text-xs",
        "autofill:top-1.5 autofill:text-xs"
      )}
    >
      {label}
    </label>
    {children}
  </div>
);

const SuccessView = ({ isLogin }) => (
  <motion.div
    key="success"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center flex flex-col items-center justify-center h-full min-h-[400px]"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="p-4 bg-emerald-500/20 rounded-full"
    >
      <FiCheckCircle className="text-emerald-400 text-6xl" />
    </motion.div>
    <h2 className="text-3xl font-bold text-white mt-6">
      {isLogin ? "Login Successful!" : "Account Created!"}
    </h2>
    <p className="text-white/60 mt-2">
      {isLogin ? "Redirecting..." : "You can now sign in."}
    </p>
  </motion.div>
);

export default Login;
