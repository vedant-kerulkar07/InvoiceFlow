import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

import {
  getInvoices,
  deleteInvoice,
} from "../../services/invoice.service";

import Loading from "../../components/common/Loading";

/* ---------- Animation variants ---------- */
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const rowExit = { opacity: 0, x: -16, transition: { duration: 0.2 } };

/* ---------- Shared styles ---------- */
const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const actionButton =
  "inline-flex items-center justify-center rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const deleteButton =
  "inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";

const headerCell = "px-6 py-3.5 text-xs font-medium text-[#6B6785]";

const metaLabel = "text-xs text-[#6B6785]";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInvoices();

      setInvoices(data.invoices || []);
    } catch (error) {
      setError(error.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteInvoice(id);

      setInvoices((previousInvoices) =>
        previousInvoices.filter(
          (invoice) => invoice._id !== id
        )
      );
    } catch (error) {
      setError(error.message || "Failed to delete invoice");
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

  const itemsLabel = (invoice) =>
    `${invoice.items?.length || 0} item${
      invoice.items?.length === 1 ? "" : "s"
    }`;

  if (loading) {
    return <Loading />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
              Invoices
            </h1>

            <p className="mt-1 text-sm text-[#6B6785]">
              Create, manage and track your invoices.
            </p>
          </div>

          <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <Link to="/invoices/create" className={`${primaryButton} w-full`}>
              + Create Invoice
            </Link>
          </motion.div>
        </motion.div>

        {/* Error */}
        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              key="error"
              role="alert"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="mt-8">
          <p className="text-sm text-[#6B6785]">
            Total Invoices:{" "}
            <span className="font-semibold text-[#2B2640]">
              {invoices.length}
            </span>
          </p>
        </div>

        {/* Empty State */}
        {invoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-4 rounded-2xl border border-dashed border-[#D9D5EA] bg-white px-6 py-16 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#2B2640]">
              No invoices found
            </h2>

            <p className="mt-2 text-sm text-[#6B6785]">
              Create your first invoice to start managing your
              billing.
            </p>

            <Link to="/invoices/create" className={`${primaryButton} mt-6`}>
              Create Invoice
            </Link>
          </motion.div>
        ) : (
          <>
            {/* ---------- Mobile / Tablet: cards ---------- */}
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden"
            >
              <AnimatePresence>
                {invoices.map((invoice) => (
                  <motion.li
                    key={invoice._id}
                    variants={rowVariants}
                    exit={rowExit}
                    className="flex flex-col rounded-2xl border border-[#E8E6F2] bg-white p-4 shadow-[0_1px_2px_rgba(43,38,64,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#2B2640]">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-0.5 text-xs text-[#6B6785]">
                          {itemsLabel(invoice)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium text-[#2B2640]">
                        {invoice.client?.name || "—"}
                      </p>

                      {invoice.client?.companyName && (
                        <p className="mt-0.5 text-sm text-[#6B6785]">
                          {invoice.client.companyName}
                        </p>
                      )}
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <dt className={metaLabel}>Issue Date</dt>
                        <dd className="mt-0.5 text-sm text-[#2B2640]">
                          {formatDate(invoice.issueDate)}
                        </dd>
                      </div>

                      <div>
                        <dt className={metaLabel}>Due Date</dt>
                        <dd className="mt-0.5 text-sm text-[#2B2640]">
                          {formatDate(invoice.dueDate)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0EEF7] pt-4">
                      <span className={metaLabel}>Amount</span>

                      <span className="text-lg font-semibold text-[#2B2640]">
                        {formatCurrency(invoice.grandTotal)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className={actionButton}
                      >
                        View
                      </Link>

                      <Link
                        to={`/invoices/edit/${invoice._id}`}
                        className={actionButton}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(invoice._id)}
                        className={deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            {/* ---------- Desktop: table ---------- */}
            <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.15)] lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#E8E6F2] bg-[#FBFAFE]">
                    <tr>
                      <th className={`${headerCell} text-left`}>Invoice</th>
                      <th className={`${headerCell} text-left`}>Client</th>
                      <th className={`${headerCell} text-left`}>Issue Date</th>
                      <th className={`${headerCell} text-left`}>Due Date</th>
                      <th className={`${headerCell} text-right`}>Amount</th>
                      <th className={`${headerCell} text-center`}>Status</th>
                      <th className={`${headerCell} text-right`}>Actions</th>
                    </tr>
                  </thead>

                  <motion.tbody
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-[#F0EEF7]"
                  >
                    <AnimatePresence>
                      {invoices.map((invoice) => (
                        <motion.tr
                          key={invoice._id}
                          variants={rowVariants}
                          exit={rowExit}
                          className="transition-colors hover:bg-[#FBFAFE]"
                        >
                          {/* Invoice Number */}
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#2B2640]">
                              {invoice.invoiceNumber}
                            </p>

                            <p className="mt-1 text-xs text-[#6B6785]">
                              {itemsLabel(invoice)}
                            </p>
                          </td>

                          {/* Client */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-[#2B2640]">
                                {invoice.client?.name || "—"}
                              </p>

                              {invoice.client?.companyName && (
                                <p className="mt-1 text-sm text-[#6B6785]">
                                  {invoice.client.companyName}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Issue Date */}
                          <td className="px-6 py-4 text-sm text-[#4A4563]">
                            {formatDate(invoice.issueDate)}
                          </td>

                          {/* Due Date */}
                          <td className="px-6 py-4 text-sm text-[#4A4563]">
                            {formatDate(invoice.dueDate)}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 text-right">
                            <p className="font-semibold text-[#2B2640]">
                              {formatCurrency(invoice.grandTotal)}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                                invoice.status
                              )}`}
                            >
                              {invoice.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/invoices/${invoice._id}`}
                                className={actionButton}
                              >
                                View
                              </Link>

                              <Link
                                to={`/invoices/edit/${invoice._id}`}
                                className={actionButton}
                              >
                                Edit
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDelete(invoice._id)}
                                className={deleteButton}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </motion.tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MotionConfig>
  );
};

export default Invoices;