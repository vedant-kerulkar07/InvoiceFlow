import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

import { createClient } from "../../services/client.service";

/* ---------- Shared styles ---------- */
const inputClass =
  "w-full rounded-xl border border-[#E8E6F2] bg-[#FBFAFE] px-4 py-3 text-sm text-[#2B2640] outline-none transition placeholder:text-[#A9A5BF] hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

const labelClass = "mb-2 block text-sm font-medium text-[#2B2640]";

const Required = () => (
  <span className="text-rose-500" aria-hidden="true">
    {" "}
    *
  </span>
);

const CreateClient = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    billingAddress: "",
    gstNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createClient(formData);

      navigate("/clients");
    } catch (error) {
      setError(error.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-8"
        >
          <Link
            to="/clients"
            className="rounded text-sm font-medium text-[#6B6785] transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            ← Back to Clients
          </Link>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
            Add Client
          </h1>

          <p className="mt-1 text-sm text-[#6B6785]">
            Add a new client and their billing information.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="error"
              role="alert"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="rounded-2xl border border-[#E8E6F2] bg-white p-5 shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.18)] sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
            {/* Client Name */}
            <div>
              <label htmlFor="name" className={labelClass}>
                Client Name
                <Required />
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter client name"
                className={inputClass}
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className={labelClass}>
                Company Name
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
                <Required />
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="client@example.com"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputClass}
              />
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gstNumber" className={labelClass}>
                GST Number
              </label>

              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="Enter GST number"
                className={`${inputClass} uppercase placeholder:normal-case`}
              />
            </div>

            {/* Billing Address */}
            <div className="md:col-span-2">
              <label htmlFor="billingAddress" className={labelClass}>
                Billing Address
              </label>

              <textarea
                id="billingAddress"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                rows={4}
                placeholder="Enter billing address"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#F0EEF7] pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/clients"
              className="inline-flex items-center justify-center rounded-xl border border-[#E8E6F2] bg-white px-5 py-2.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
            >
              Cancel
            </Link>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? undefined : { y: -1 }}
              whileTap={loading ? undefined : { scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loading ? "Creating..." : "Create Client"}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </MotionConfig>
  );
};

export default CreateClient;