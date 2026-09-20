import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { loginUser } from "../../services/auth.service";

/* ---------- Animation variants ---------- */
const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ---------- Shared input style ---------- */
const inputClass =
  "w-full rounded-xl border border-[#E8E6F2] bg-[#FBFAFE] px-4 py-3 text-sm text-[#2B2640] outline-none transition placeholder:text-[#A9A5BF] hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

const labelClass = "block text-sm font-medium text-[#2B2640]";

/* ---------- Static invoice preview (left panel) ---------- */
const InvoicePreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 24, rotate: 1 }}
    animate={{ opacity: 1, y: 0, rotate: 2 }}
    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-[#2B2640] shadow-2xl shadow-black/30"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold">INV-2026-002</p>
        <p className="mt-0.5 text-xs text-[#6B6785]">Due 30 Oct 2026</p>
      </div>

      <motion.span
        initial={{ opacity: 0, scale: 0.5, rotate: 12 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 14,
          delay: 1,
        }}
        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
      >
        Unpaid
      </motion.span>
    </div>

    <div className="mt-5 space-y-3 border-t border-[#E8E6F2] pt-4 text-sm">
      <div className="flex justify-between">
        <span className="text-[#6B6785]">Logo design</span>
        <span className="font-medium">₹18,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#6B6785]">Brand guidelines</span>
        <span className="font-medium">₹7,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#6B6785]">GST 18%</span>
        <span className="font-medium">₹4,500</span>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-[#E8E6F2] pt-4">
      <span className="text-sm font-medium">Total</span>
      <span className="text-xl font-bold text-violet-700">₹29,500</span>
    </div>
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await loginUser(formData);

      // After successful login
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F7F6FB] lg:grid lg:grid-cols-2">
        {/* ---------- Left panel (desktop only) ---------- */}
        <aside className="relative hidden overflow-hidden bg-[#2F1B5E] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          {/* single soft glow */}
          <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />

          <Link to="/" className="relative text-2xl font-bold tracking-tight">
            InvoiceFlow
          </Link>

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-md text-4xl font-bold leading-tight tracking-tight"
            >
              Pick up where you left off.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-sm text-base text-violet-200"
            >
              Your clients, invoices and payment status are waiting.
            </motion.p>

            <div className="mt-10">
              <InvoicePreview />
            </div>
          </div>

          <p className="relative text-xs text-violet-300">
            © 2026 InvoiceFlow. All rights reserved.
          </p>
        </aside>

        {/* ---------- Right panel: form ---------- */}
        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:min-h-0">
          <div className="w-full max-w-md">
            {/* Brand (mobile / tablet only) */}
            <div className="mb-8 text-center lg:hidden">
              <Link
                to="/"
                className="inline-block text-3xl font-bold tracking-tight text-violet-700"
              >
                InvoiceFlow
              </Link>

              <p className="mt-2 text-sm text-[#6B6785]">
                Simple invoicing for your business
              </p>
            </div>

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="rounded-2xl border border-[#E8E6F2] bg-white p-6 shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-16px_rgba(91,33,182,0.18)] sm:p-8"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[#2B2640]">
                  Welcome back
                </h1>

                <p className="mt-1 text-sm text-[#6B6785]">
                  Sign in to continue to InvoiceFlow.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    key="error"
                    role="alert"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                      <p className="text-sm text-rose-700">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.form
                onSubmit={handleSubmit}
                variants={formVariants}
                initial="hidden"
                animate="show"
                className="space-y-5"
              >
                {/* Email */}
                <motion.div variants={fieldVariants}>
                  <label htmlFor="email" className={`${labelClass} mb-2`}>
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </motion.div>

                {/* Password */}
                <motion.div variants={fieldVariants}>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className={labelClass}>
                      Password
                    </label>

                    <button
                      type="button"
                      className="rounded text-xs font-medium text-violet-700 transition-colors hover:text-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className={inputClass}
                  />
                </motion.div>

                {/* Submit */}
                <motion.div variants={fieldVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={loading ? undefined : { y: -1 }}
                    whileTap={loading ? undefined : { scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {loading ? "Signing in..." : "Sign in"}
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Register */}
              <div className="mt-6 border-t border-[#E8E6F2] pt-6 text-center">
                <p className="text-sm text-[#6B6785]">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-violet-700 hover:text-violet-800 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </motion.div>

            <p className="mt-6 text-center text-xs text-[#6B6785] lg:hidden">
              © 2026 InvoiceFlow. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
};

export default Login;