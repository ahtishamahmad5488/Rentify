import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAdmin } from "../api/adminApi";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuALibrba1ANVTvpdsz5kJxFACLvcilk0Ld8ce4o3oSLpl7LP5vZoP-nt5VntwGdf3BZwKQ3rUgVoRpUSKucv1vBgZ3BXAjFTo3GdvR-sbstwXhpdezVv4-uD0KLXXDWpFW-eIiFNIsffKRfsgYp8Kl6bIrKNj3zRZ1-5yjPv4YdXu0XJow0Bkh0PiLP3hSv4wRRj6g_YdYuMR8-V9Y1zvwC-HpLF4zKXFHURYryG5hd_DqvVQIahotkNkRZrWzv1tAqDx2h-LumkIYa";

export default function Login() {
  // console.log("ENV EMAIL:", process.env.ADMIN_EMAIL);
  // console.log("ENV PASSWORD:", process.env.ADMIN_PASSWORD);
  // console.log("INPUT EMAIL:", email);
  // console.log("INPUT PASSWORD:", password);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginAdmin(email, password);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex items-center justify-center font-display">
      <div className="w-full max-w-screen-xl flex flex-col items-center justify-center p-6">
        {/* Header / Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined text-3xl">domain</span>
          </div>
          <h1 className="text-slate-900 text-2xl font-bold tracking-tight">
            StayHub Admin
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-slate-200">
          {/* Visual Accent */}
          <div
            className="h-32 sm:h-48 w-full bg-cover bg-center relative"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-white to-transparent" />
          </div>

          <div className="px-5 sm:px-8 pb-8 sm:pb-10 pt-2">
            <div className="mb-6 text-center">
              <h2 className="text-slate-900 text-2xl font-bold">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Manage your hostel listings across Pakistan
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {error}
                </div>
              )}
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-slate-700 text-sm font-medium"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    mail
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@stayhub.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label
                    className="text-slate-700 text-sm font-medium"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-primary text-xs font-semibold hover:underline cursor-pointer"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    lock
                  </span>
                  <input
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="text-slate-600 text-sm" htmlFor="remember">
                  Remember this device
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Logging in..." : "Login to Dashboard"}</span>
                {!loading && (
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-sm">
                Need help accessing your account?
                <br />
                <a
                  className="text-primary font-medium hover:underline"
                  href="#"
                >
                  Contact Support Team
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-slate-400 text-xs">
          <p>&copy; 2024 StayHub Pakistan. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a className="hover:text-primary" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary" href="#">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
