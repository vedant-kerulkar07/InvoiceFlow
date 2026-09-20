import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

import { createInvoice } from "../../services/invoice.service";
import { getClients } from "../../services/client.service";
import Loading from "../../components/common/Loading";

/* ---------- Animation variants ---------- */

const formVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/* ---------- Shared styles ---------- */

const inputClass =
  "w-full rounded-xl border border-[#E8E6F2] bg-[#FBFAFE] px-4 py-3 text-sm text-[#2B2640] outline-none transition placeholder:text-[#A9A5BF] hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

const itemInputClass =
  "w-full rounded-xl border border-[#E8E6F2] bg-white px-3 py-2.5 text-sm text-[#2B2640] outline-none transition placeholder:text-[#A9A5BF] hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const labelClass =
  "mb-2 block text-sm font-medium text-[#2B2640]";

const itemLabelClass =
  "mb-2 block text-xs font-medium text-[#6B6785]";

const cardClass =
  "rounded-2xl border border-[#E8E6F2] bg-white p-5 shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-24px_rgba(91,33,182,0.18)] sm:p-6";

const Required = () => (
  <span
    className="text-rose-500"
    aria-hidden="true"
  >
    {" "}
    *
  </span>
);

const CreateInvoice = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [formData, setFormData] = useState({
    client: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    taxPercentage: 0,
    discount: 0,
    status: "Draft",
  });

  const [items, setItems] = useState([
    {
      description: "",
      quantity: 1,
      rate: 0,
    },
  ]);

  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Fetch clients ---------- */

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        setError("");

        const data = await getClients();

        setClients(data.clients || []);
      } catch (error) {
        setError(
          error.message || "Failed to load clients"
        );
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  /* ---------- Main form fields ---------- */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /* ---------- Invoice items ---------- */

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    setItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((previousItems) => [
      ...previousItems,
      {
        description: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((previousItems) =>
      previousItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  /* ---------- Calculations ---------- */

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;

      return total + quantity * rate;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    const taxPercentage =
      Number(formData.taxPercentage) || 0;

    return (subtotal * taxPercentage) / 100;
  }, [subtotal, formData.taxPercentage]);

  const grandTotal = useMemo(() => {
    const discount =
      Number(formData.discount) || 0;

    return subtotal + taxAmount - discount;
  }, [
    subtotal,
    taxAmount,
    formData.discount,
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  /* ---------- Submit ---------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!formData.client) {
        setError("Please select a client.");
        return;
      }

      if (!formData.issueDate) {
        setError("Issue date is required.");
        return;
      }

      if (!formData.dueDate) {
        setError("Due date is required.");
        return;
      }

      if (items.length === 0) {
        setError(
          "Invoice must contain at least one item."
        );
        return;
      }

      const hasInvalidItem = items.some(
        (item) =>
          !item.description.trim() ||
          !Number.isFinite(
            Number(item.quantity)
          ) ||
          Number(item.quantity) < 1 ||
          !Number.isFinite(Number(item.rate)) ||
          Number(item.rate) < 0
      );

      if (hasInvalidItem) {
        setError(
          "Please enter valid description, quantity and rate for every item."
        );
        return;
      }

      if (
        !Number.isFinite(
          Number(formData.taxPercentage)
        ) ||
        Number(formData.taxPercentage) < 0
      ) {
        setError(
          "Tax percentage cannot be negative."
        );
        return;
      }

      if (
        !Number.isFinite(
          Number(formData.discount)
        ) ||
        Number(formData.discount) < 0
      ) {
        setError("Discount cannot be negative.");
        return;
      }

      if (grandTotal < 0) {
        setError(
          "Discount cannot be greater than the invoice total."
        );
        return;
      }

      /*
       * invoiceNumber is intentionally NOT sent.
       *
       * Backend automatically generates:
       * INV-2026-001
       * INV-2026-002
       * ...
       */

      const invoiceData = {
        client: formData.client,

        items: items.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),

        issueDate: formData.issueDate,
        dueDate: formData.dueDate,

        taxPercentage:
          Number(formData.taxPercentage),

        discount: Number(formData.discount),

        status: formData.status,
      };

      await createInvoice(invoiceData);

      navigate("/invoices");
    } catch (error) {
      setError(
        error.message || "Failed to create invoice"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingClients) {
    return <Loading />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
          className="mb-8"
        >
          <Link
            to="/invoices"
            className="rounded text-sm font-medium text-[#6B6785] transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            ← Back to Invoices
          </Link>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
            Create Invoice
          </h1>

          <p className="mt-1 text-sm text-[#6B6785]">
            Create a new invoice for your client.
          </p>
        </motion.div>

        {/* Error */}

        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="error"
              role="alert"
              initial={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                marginBottom: 24,
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          variants={formVariants}
          initial="hidden"
          animate="show"
        >
          {/* Invoice Information */}

          <motion.div
            variants={sectionVariants}
            className={cardClass}
          >
            <h2 className="text-lg font-semibold text-[#2B2640]">
              Invoice Information
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">

              {/* Client */}

              <div>
                <label
                  htmlFor="client"
                  className={labelClass}
                >
                  Client
                  <Required />
                </label>

                <select
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select a client
                  </option>

                  {clients.map((client) => (
                    <option
                      key={client._id}
                      value={client._id}
                    >
                      {client.name}
                      {client.companyName
                        ? ` - ${client.companyName}`
                        : ""}
                    </option>
                  ))}
                </select>

                {clients.length === 0 && (
                  <p className="mt-2 text-xs text-rose-600">
                    No clients available. Please create
                    a client first.
                  </p>
                )}
              </div>

              {/* Invoice Number */}

              <div>
                <label
                  htmlFor="invoiceNumber"
                  className={labelClass}
                >
                  Invoice Number
                </label>

                <div className="flex min-h-[48px] items-center rounded-xl border border-dashed border-violet-200 bg-violet-50 px-4">
                  <span className="text-sm text-violet-700">
                    Generated automatically when you create
                    the invoice
                  </span>
                </div>
              </div>

              {/* Issue Date */}

              <div>
                <label
                  htmlFor="issueDate"
                  className={labelClass}
                >
                  Issue Date
                  <Required />
                </label>

                <input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Due Date */}

              <div>
                <label
                  htmlFor="dueDate"
                  className={labelClass}
                >
                  Due Date
                  <Required />
                </label>

                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Status */}

              <div>
                <label
                  htmlFor="status"
                  className={labelClass}
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Draft">
                    Draft
                  </option>
                  <option value="Unpaid">
                    Unpaid
                  </option>
                  <option value="Paid">
                    Paid
                  </option>
                  <option value="Overdue">
                    Overdue
                  </option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Items */}

          <motion.div
            variants={sectionVariants}
            className={`${cardClass} mt-6`}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2640]">
                  Invoice Items
                </h2>

                <p className="mt-1 text-sm text-[#6B6785]">
                  Add the products or services included in
                  this invoice.
                </p>
              </div>

              <motion.button
                type="button"
                onClick={addItem}
                whileTap={{
                  scale: 0.97,
                }}
                className="w-full rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:w-auto"
              >
                + Add Item
              </motion.button>
            </div>

            <div className="mt-6 space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -6,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className="rounded-xl border border-[#E8E6F2] bg-[#F7F6FB] p-4"
                  >
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-12">

                      {/* Description */}

                      <div className="col-span-2 md:col-span-5">
                        <label
                          htmlFor={`item-description-${index}`}
                          className={itemLabelClass}
                        >
                          Description
                        </label>

                        <input
                          id={`item-description-${index}`}
                          type="text"
                          value={item.description}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              "description",
                              event.target.value
                            )
                          }
                          placeholder="Website development"
                          className={itemInputClass}
                        />
                      </div>

                      {/* Quantity */}

                      <div className="col-span-1 md:col-span-2">
                        <label
                          htmlFor={`item-quantity-${index}`}
                          className={itemLabelClass}
                        >
                          Quantity
                        </label>

                        <input
                          id={`item-quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              "quantity",
                              event.target.value
                            )
                          }
                          className={itemInputClass}
                        />
                      </div>

                      {/* Rate */}

                      <div className="col-span-1 md:col-span-2">
                        <label
                          htmlFor={`item-rate-${index}`}
                          className={itemLabelClass}
                        >
                          Rate
                        </label>

                        <input
                          id={`item-rate-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              "rate",
                              event.target.value
                            )
                          }
                          className={itemInputClass}
                        />
                      </div>

                      {/* Amount */}

                      <div className="col-span-1 md:col-span-2">
                        <span className={itemLabelClass}>
                          Amount
                        </span>

                        <div className="flex h-[42px] items-center overflow-hidden rounded-xl border border-[#E8E6F2] bg-white px-3 text-sm font-semibold text-[#2B2640]">
                          <span className="truncate">
                            {formatCurrency(
                              Number(item.quantity || 0) *
                                Number(item.rate || 0)
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}

                      <div className="col-span-1 flex items-end md:col-span-1 md:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(index)
                          }
                          disabled={items.length === 1}
                          className="h-[42px] w-full rounded-xl border border-rose-200 bg-white px-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Totals */}

          <motion.div
            variants={sectionVariants}
            className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* Tax & Discount */}

            <div className={cardClass}>
              <h2 className="text-lg font-semibold text-[#2B2640]">
                Tax & Discount
              </h2>

              <div className="mt-6 space-y-5">

                {/* Tax */}

                <div>
                  <label
                    htmlFor="taxPercentage"
                    className={labelClass}
                  >
                    Tax Percentage (%)
                  </label>

                  <input
                    id="taxPercentage"
                    name="taxPercentage"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxPercentage}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Discount */}

                <div>
                  <label
                    htmlFor="discount"
                    className={labelClass}
                  >
                    Discount (₹)
                  </label>

                  <input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Summary */}

            <div className="rounded-2xl bg-[#2F1B5E] p-5 text-white shadow-lg shadow-violet-900/20 sm:p-6">
              <h2 className="text-lg font-semibold">
                Invoice Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-violet-200">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-violet-200">
                    Tax (
                    {Number(
                      formData.taxPercentage
                    ) || 0}
                    %)
                  </span>

                  <span className="font-medium">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-violet-200">
                    Discount
                  </span>

                  <span className="font-medium text-rose-300">
                    -{" "}
                    {formatCurrency(
                      Number(formData.discount) || 0
                    )}
                  </span>
                </div>

                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">
                      Grand Total
                    </span>

                    <span className="break-words text-right text-2xl font-bold">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}

          <motion.div
            variants={sectionVariants}
            className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
          >
            <Link
              to="/invoices"
              className="inline-flex items-center justify-center rounded-xl border border-[#E8E6F2] bg-white px-5 py-2.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
            >
              Cancel
            </Link>

            <motion.button
              type="submit"
              disabled={
                saving || clients.length === 0
              }
              whileHover={
                saving ? undefined : { y: -1 }
              }
              whileTap={
                saving ? undefined : { scale: 0.98 }
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {saving
                ? "Creating..."
                : "Create Invoice"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </MotionConfig>
  );
};

export default CreateInvoice;