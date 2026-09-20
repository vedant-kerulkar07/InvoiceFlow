import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

import {
  getInvoiceById,
  deleteInvoice,
} from "../../services/invoice.service";

import Loading from "../../components/common/Loading";

/* ---------- Animation variants ---------- */
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/* ---------- Shared styles ---------- */
const backLink =
  "rounded text-sm font-medium text-[#6B6785] transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const editButton =
  "inline-flex items-center justify-center rounded-xl border border-[#E8E6F2] bg-white px-4 py-2.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100";

const deleteButton =
  "inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50";

const metaLabel = "text-xs font-medium text-[#6B6785]";

const headerCell = "px-5 py-3.5 text-xs font-medium text-[#6B6785]";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getInvoiceById(id);

        setInvoice(data.invoice);
      } catch (error) {
        setError(
          error.message || "Failed to load invoice"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteInvoice(id);

      navigate("/invoices", { replace: true });
    } catch (error) {
      setError(
        error.message || "Failed to delete invoice"
      );
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-teal-50 text-teal-700 ring-teal-200";

      case "Unpaid":
        return "bg-amber-50 text-amber-700 ring-amber-200";

      case "Overdue":
        return "bg-rose-50 text-rose-700 ring-rose-200";

      case "Draft":
      default:
        return "bg-[#F1EFF8] text-[#4A4563] ring-[#E0DCEF]";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !invoice) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/invoices" className={backLink}>
          ← Back to Invoices
        </Link>

        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
        >
          <h1 className="text-lg font-semibold text-rose-700">
            Unable to load invoice
          </h1>

          <p className="mt-2 text-sm text-rose-600">
            {error}
          </p>

          <Link to="/invoices" className={`${primaryButton} mt-6`}>
            Back to Invoices
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const client = invoice.client || {};

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link to="/invoices" className={backLink}>
              ← Back to Invoices
            </Link>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
              Invoice Details
            </h1>

            <p className="mt-1 text-sm text-[#6B6785]">
              View complete invoice and billing information.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Link
              to={`/invoices/edit/${invoice._id}`}
              className={editButton}
            >
              Edit
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={deleteButton}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
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

        {/* Invoice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.18)]"
        >
          {/* Invoice Header */}
          <div className="border-b border-[#E8E6F2] px-5 py-6 sm:px-8">
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#6B6785]">
                  Invoice
                </p>

                <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-[#2B2640]">
                  {invoice.invoiceNumber}
                </h2>
              </div>

              <div className="sm:text-right">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              <div>
                <p className={metaLabel}>Issue Date</p>

                <p className="mt-1 text-sm font-medium text-[#2B2640]">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>

              <div>
                <p className={metaLabel}>Due Date</p>

                <p className="mt-1 text-sm font-medium text-[#2B2640]">
                  {formatDate(invoice.dueDate)}
                </p>
              </div>

              <div>
                <p className={metaLabel}>Created</p>

                <p className="mt-1 text-sm font-medium text-[#2B2640]">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="border-b border-[#E8E6F2] px-5 py-6 sm:px-8">
            <h3 className="text-lg font-semibold text-[#2B2640]">
              Bill To
            </h3>

            <div className="mt-4 rounded-xl bg-[#F7F6FB] p-4 sm:p-5">
              <p className="text-base font-semibold text-[#2B2640]">
                {client.name || "—"}
              </p>

              {client.companyName && (
                <p className="mt-1 text-sm text-[#6B6785]">
                  {client.companyName}
                </p>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className={metaLabel}>Email</p>

                  <p className="mt-1 break-words text-sm text-[#4A4563]">
                    {client.email || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className={metaLabel}>Phone</p>

                  <p className="mt-1 break-words text-sm text-[#4A4563]">
                    {client.phone || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className={metaLabel}>GST Number</p>

                  <p className="mt-1 break-words text-sm text-[#4A4563]">
                    {client.gstNumber || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className={metaLabel}>Billing Address</p>

                  <p className="mt-1 whitespace-pre-line break-words text-sm text-[#4A4563]">
                    {client.billingAddress || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="border-b border-[#E8E6F2] px-5 py-6 sm:px-8">
            <h3 className="text-lg font-semibold text-[#2B2640]">
              Invoice Items
            </h3>

            {/* Mobile: item cards */}
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="mt-5 space-y-3 md:hidden"
            >
              {invoice.items?.map((item, index) => (
                <motion.li
                  key={index}
                  variants={rowVariants}
                  className="rounded-xl border border-[#E8E6F2] p-4"
                >
                  <p className="break-words text-sm font-medium text-[#2B2640]">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-sm text-[#6B6785]">
                      {item.quantity} × {formatCurrency(item.rate)}
                    </p>

                    <p className="text-sm font-semibold text-[#2B2640]">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* Tablet / Desktop: table */}
            <div className="mt-5 hidden overflow-hidden rounded-xl border border-[#E8E6F2] md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#E8E6F2] bg-[#FBFAFE]">
                    <tr>
                      <th className={`${headerCell} text-left`}>
                        Description
                      </th>

                      <th className={`${headerCell} text-center`}>
                        Quantity
                      </th>

                      <th className={`${headerCell} text-right`}>
                        Rate
                      </th>

                      <th className={`${headerCell} text-right`}>
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <motion.tbody
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-[#F0EEF7]"
                  >
                    {invoice.items?.map((item, index) => (
                      <motion.tr key={index} variants={rowVariants}>
                        <td className="px-5 py-4 text-sm font-medium text-[#2B2640]">
                          {item.description}
                        </td>

                        <td className="px-5 py-4 text-center text-sm text-[#4A4563]">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-[#4A4563]">
                          {formatCurrency(item.rate)}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-[#2B2640]">
                          {formatCurrency(item.amount)}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="px-5 py-6 sm:px-8">
            <div className="ml-auto w-full max-w-md">
              <div className="space-y-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#6B6785]">Subtotal</span>

                  <span className="font-medium text-[#2B2640]">
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#6B6785]">
                    Tax ({invoice.taxPercentage || 0}%)
                  </span>

                  <span className="font-medium text-[#2B2640]">
                    {formatCurrency(invoice.taxAmount)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#6B6785]">Discount</span>

                  <span className="font-medium text-rose-600">
                    - {formatCurrency(invoice.discount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl bg-[#2F1B5E] px-4 py-4 text-white shadow-lg shadow-violet-900/20 sm:px-5">
                  <span className="text-base font-semibold sm:text-lg">
                    Grand Total
                  </span>

                  <span className="break-words text-right text-xl font-bold sm:text-2xl">
                    {formatCurrency(invoice.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default InvoiceDetails;