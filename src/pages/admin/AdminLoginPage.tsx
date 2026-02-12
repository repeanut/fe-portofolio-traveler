import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminToast } from "../../hooks/useAdminToast";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useAdminToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("isAuthenticated") === "true" ||
      sessionStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) navigate("/admin/dashboard");
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedIdentifier = (identifier || "").trim();
    const normalizedPassword = (password || "").trim();

    if (!normalizedIdentifier) return;
    if (!normalizedPassword) return;

    setIsSubmitting(true);
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("isAuthenticated", "true");
      storage.setItem("authProvider", "admin-local");
      storage.setItem("authToken", "admin-local-token");
      storage.setItem("userEmail", normalizedIdentifier);
      storage.setItem("userName", "Admin");
      storage.setItem("isAdmin", "true");

      if (!rememberMe) {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("authProvider");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
      } else {
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("authProvider");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("isAdmin");
      }

      window.dispatchEvent(new Event("auth:changed"));
      toast.success("Login successful", "Welcome back, Admin.");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Login admin gagal. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.20)] grid grid-cols-1 md:grid-cols-2">
        <div
          className="relative overflow-hidden px-10 py-10 md:py-14 flex flex-col justify-center"
          style={{
            backgroundImage: "url('/bg-signup-login.png')",
            backgroundSize: "cover",
            backgroundPosition: "start",
          }}
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-24 bottom-[-120px] h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center justify-center gap-2 text-white">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center">
              Admin Access
            </h2>
          </div>
          <p className="relative mt-4 max-w-sm text-sm md:text-base text-white/80 text-center mx-auto">
            Sign in to manage the dashboard, users, and content.
          </p>

          <div className="relative mt-10 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white/12">
              <div className="h-8 w-8 rounded-full font-semibold text-sm flex items-center justify-center bg-white text-[#0b2c8f]">
                1
              </div>
              <p className="text-sm font-medium text-white">Admin sign in</p>
            </div>
          </div>
        </div>

        <div className="relative px-8 py-10 md:px-10 md:py-14">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900">Log In (Admin)</h3>
            <p className="mt-1 text-xs text-slate-500">Use your registered admin credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">Email or Username</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                placeholder="eg. admin@travello.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-sky-300"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Minimum 8 characters.</p>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-xs font-semibold text-slate-900"
                onClick={() => alert("Please contact the super admin to reset your password.")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:hover:bg-slate-900 text-white text-sm font-semibold transition-colors"
            >
              {isSubmitting ? "Signing In..." : "Log In as Admin"}
            </button>

            <div className="mt-6 text-center text-xs text-slate-500">
              Back to
              <button
                type="button"
                onClick={() => navigate("/")}
                className="ml-1 font-semibold text-slate-900"
              >
                Landing Page
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
