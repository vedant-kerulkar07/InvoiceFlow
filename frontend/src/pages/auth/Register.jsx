import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { registerUser } from "../../services/auth.service";

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

const labelClass = "mb-2 block text-sm font-medium text-[#2B2640]";

/* ---------- Static invoice preview (left panel) ---------- */
const InvoicePreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 24, rotate: -1 }}
    animate={{ opacity: 1, y: 0, rotate: -2 }}
    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-[#2B2640] shadow-2xl shadow-black/30"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold">INV-2026-001</p>
        <p className="mt-0.5 text-xs text-[#6B6785]">Due 15 Oct 2026</p>
      </div>

      <motion.span
        initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 14,
          delay: 1,
        }}
        className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200"
      >
        Paid
      </motion.span>
    </div>

    <div className="mt-5 space-y-3 border-t border-[#E8E6F2] pt-4 text-sm">
      <div className="flex justify-between">
        <span className="text-[#6B6785]">Website design</span>
        <span className="font-medium">₹45,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#6B6785]">Hosting (1 year)</span>
        <span className="font-medium">₹6,000</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#6B6785]">GST 18%</span>
        <span className="font-medium">₹9,180</span>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-[#E8E6F2] pt-4">
      <span className="text-sm font-medium">Total</span>
      <span className="text-xl font-bold text-violet-700">₹60,180</span>
    </div>
  </motion.div>
);

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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

      await registerUser(formData);

      // After successful registration
      navigate("/login");
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
              Send the invoice. Track the payment.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-sm text-base text-violet-200"
            >
              Clients, invoices and payment status, all in one place.
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
                  Create your account
                </h1>

                <p className="mt-1 text-sm text-[#6B6785]">
                  Start managing your invoices today.
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
                {/* Name */}
                <motion.div variants={fieldVariants}>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className={inputClass}
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={fieldVariants}>
                  <label htmlFor="email" className={labelClass}>
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
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-xs text-[#6B6785]">
                    Password must contain at least 6 characters.
                  </p>
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
                    {loading ? "Creating account..." : "Create account"}
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Login */}
              <div className="mt-6 border-t border-[#E8E6F2] pt-6 text-center">
                <p className="text-sm text-[#6B6785]">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-violet-700 hover:text-violet-800 hover:underline"
                  >
                    Sign in
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

export default Register;