import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      sessionStorage.setItem("rivelune_admin_token", data.token);
      sessionStorage.setItem("rivelune_admin", JSON.stringify(data.admin));

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f5f0] px-4 py-10">

      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#e8dfd0]/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#d8c9b5]/30 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.08)] border border-[#eae6df] overflow-hidden">

          {/* Top Accent */}
          <div className="h-1.5 bg-[#b59a72]" />

          <div className="px-7 py-9 sm:px-10 sm:py-11">

            {/* Brand */}
            <div className="text-center mb-8">

              <h2 className="text-3xl sm:text-4xl font-serif tracking-[0.25em] text-[#171717]">
                RIVELUNE
              </h2>

              <p className="text-[10px] tracking-[0.35em] text-[#9b8b76] mt-2">
                THE MODERN WARDROBE
              </p>

              <div className="w-12 h-px bg-[#c6ad8b] mx-auto mt-5" />
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-[#f5f1ea] flex items-center justify-center border border-[#e7ddcf]">
                <ShieldCheck className="text-[#a48a65]" size={27} />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-[#222222]">
                Admin Login
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Sign in to access the administration panel.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-[#383838] mb-2"
                >
                  Email Address
                </label>

                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full px-4 py-3.5 bg-[#faf9f7] border border-[#e4dfd7] rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#b49a75] focus:ring-2 focus:ring-[#b49a75]/20"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-[#383838] mb-2"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-[#faf9f7] border border-[#e4dfd7] rounded-lg text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all focus:border-[#b49a75] focus:ring-2 focus:ring-[#b49a75]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#a48a65] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                >
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1c1c1c] hover:bg-[#383838] text-white rounded-lg text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-8 pt-5 border-t border-[#eeeae4]">

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={15} className="text-[#b49a75]" />
                <span>Authorized personnel only</span>
              </div>

            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <p className="text-center text-xs text-[#a49a8c] mt-6 tracking-wide">
          © {new Date().getFullYear()} RIVELUNE. All rights reserved.
        </p>

      </div>
    </main>
  );
};

export default AdminLogin;