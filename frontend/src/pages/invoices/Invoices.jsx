import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  MotionConfig,
} from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Pencil,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import {
  getInvoices,
  deleteInvoice,
} from "../../services/invoice.service";

import Loading from "../../components/common/Loading";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

/* ---------- Animation variants ---------- */

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const rowExit = {
  opacity: 0,
  x: -16,
  transition: {
    duration: 0.2,
  },
};

/* ---------- Shared styles ---------- */

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const actionButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-sm font-medium text-[#2B2640] transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const deleteButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50";

const metaLabel =
  "text-xs font-medium uppercase tracking-wide text-[#8B879F]";

/* ---------- Component ---------- */

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- Fetch invoices ---------- */

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInvoices();

      setInvoices(data.invoices || []);
    } catch (error) {
      setError(
        error.message || "Failed to load invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ---------- Delete invoice ---------- */

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
      setError(
        error.message || "Failed to delete invoice"
      );
    }
  };

  /* ---------- Helpers ---------- */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      case "Unpaid":
        return "bg-amber-50 text-amber-700 ring-amber-200";

      case "Overdue":
        return "bg-rose-50 text-rose-700 ring-rose-200";

      case "Draft":
      default:
        return "bg-[#F1EFF8] text-[#4A4563] ring-[#E0DCEF]";
    }
  };

  const itemsLabel = (invoice) => {
    const count = invoice.items?.length || 0;

    return `${count} item${count === 1 ? "" : "s"}`;
  };

  /* ---------- Loading ---------- */

  if (loading) {
    return <Loading />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9FD]">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* ---------- Header ---------- */}

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
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:flex">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
                  Invoices
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-[#6B6785]">
                  Create, manage and track your invoices.
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/invoices/create"
                className={`${primaryButton} w-full sm:w-auto`}
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Link>
            </motion.div>
          </motion.div>

          {/* ---------- Error ---------- */}

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                key="error"
                role="alert"
                initial={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  marginTop: 24,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
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

          {/* ---------- Summary ---------- */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.1,
              duration: 0.3,
            }}
            className="mt-7 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-[#6B6785]">
                Total Invoices
              </p>

              <p className="mt-1 text-2xl font-bold text-[#2B2640]">
                {invoices.length}
              </p>
            </div>

            {invoices.length > 0 && (
              <div className="hidden items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 sm:flex">
                <FileText className="h-3.5 w-3.5" />
                {invoices.length === 1
                  ? "1 invoice"
                  : `${invoices.length} invoices`}
              </div>
            )}
          </motion.div>

          {/* ---------- Empty State ---------- */}

          {invoices.length === 0 ? (
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
              className="mt-5 rounded-2xl border border-dashed border-[#D9D5EA] bg-white px-6 py-16 text-center shadow-sm"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <FileText className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#2B2640]">
                No invoices found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B6785]">
                Create your first invoice to start
                managing your billing.
              </p>

              <Link
                to="/invoices/create"
                className={`${primaryButton} mt-6`}
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Link>
            </motion.div>
          ) : (
            <>
              {/* =====================================================
                  MOBILE / TABLET CARDS
              ====================================================== */}

              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden"
              >
                <AnimatePresence>
                  {invoices.map((invoice) => (
                    <motion.li
                      key={invoice._id}
                      variants={rowVariants}
                      exit={rowExit}
                      layout
                      className="flex flex-col rounded-2xl border border-[#E8E6F2] bg-white p-4 shadow-[0_1px_2px_rgba(43,38,64,0.04)] sm:p-5"
                    >
                      {/* Card Header */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#2B2640]">
                              {invoice.invoiceNumber}
                            </p>

                            <p className="mt-0.5 text-xs text-[#8B879F]">
                              {itemsLabel(invoice)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>

                      {/* Client */}

                      <div className="mt-5 rounded-xl bg-[#F9F8FC] p-3.5">
                        <p className="text-sm font-semibold text-[#2B2640]">
                          {invoice.client?.name || "—"}
                        </p>

                        {invoice.client?.companyName && (
                          <p className="mt-0.5 text-sm text-[#6B6785]">
                            {invoice.client.companyName}
                          </p>
                        )}

                        {invoice.client?.email && (
                          <p className="mt-1 truncate text-xs text-[#8B879F]">
                            {invoice.client.email}
                          </p>
                        )}
                      </div>

                      {/* Dates */}

                      <dl className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[#EEEAF7] p-3">
                          <dt className={metaLabel}>
                            Issue Date
                          </dt>

                          <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#2B2640]">
                            <CalendarDays className="h-3.5 w-3.5 text-violet-600" />
                            {formatDate(invoice.issueDate)}
                          </dd>
                        </div>

                        <div className="rounded-xl border border-[#EEEAF7] p-3">
                          <dt className={metaLabel}>
                            Due Date
                          </dt>

                          <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#2B2640]">
                            <CalendarDays className="h-3.5 w-3.5 text-violet-600" />
                            {formatDate(invoice.dueDate)}
                          </dd>
                        </div>
                      </dl>

                      {/* Amount */}

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0EEF7] pt-4">
                        <div className="flex items-center gap-1.5">
                          <IndianRupee className="h-4 w-4 text-violet-600" />

                          <span className={metaLabel}>
                            Amount
                          </span>
                        </div>

                        <span className="text-lg font-bold text-[#2B2640]">
                          {formatCurrency(
                            invoice.grandTotal
                          )}
                        </span>
                      </div>

                      {/* Actions */}

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className={actionButton}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>

                        <Link
                          to={`/invoices/edit/${invoice._id}`}
                          className={actionButton}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(invoice._id)
                          }
                          className={deleteButton}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>

              {/* =====================================================
                  DESKTOP SHADCN TABLE
              ====================================================== */}

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
                  delay: 0.1,
                }}
                className="mt-5 hidden overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.15)] lg:block"
              >
                <div className="border-b border-[#E8E6F2] bg-white px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[#2B2640]">
                        All Invoices
                      </h2>

                      <p className="mt-0.5 text-xs text-[#8B879F]">
                        Manage your invoice records
                      </p>
                    </div>

                    <div className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                      {invoices.length}{" "}
                      {invoices.length === 1
                        ? "Invoice"
                        : "Invoices"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table className="min-w-[1050px]">
                    <TableHeader>
                      <TableRow className="border-[#E8E6F2] bg-[#FBFAFE] hover:bg-[#FBFAFE]">
                        <TableHead className="h-12 px-6 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Invoice
                        </TableHead>

                        <TableHead className="h-12 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Client
                        </TableHead>

                        <TableHead className="h-12 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Issue Date
                        </TableHead>

                        <TableHead className="h-12 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Due Date
                        </TableHead>

                        <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Amount
                        </TableHead>

                        <TableHead className="h-12 text-center text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Status
                        </TableHead>

                        <TableHead className="h-12 px-6 text-right text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <AnimatePresence>
                        {invoices.map((invoice) => (
                          <motion.tr
                            key={invoice._id}
                            variants={rowVariants}
                            initial="hidden"
                            animate="show"
                            exit={rowExit}
                            layout
                            className="border-[#F0EEF7] transition-colors hover:bg-[#FCFBFE]"
                          >
                            {/* Invoice */}

                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                  <FileText className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-[#2B2640]">
                                    {invoice.invoiceNumber}
                                  </p>

                                  <p className="mt-0.5 text-xs text-[#8B879F]">
                                    {itemsLabel(invoice)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Client */}

                            <TableCell>
                              <div className="min-w-[180px]">
                                <p className="font-medium text-[#2B2640]">
                                  {invoice.client?.name ||
                                    "—"}
                                </p>

                                {invoice.client
                                  ?.companyName && (
                                  <p className="mt-0.5 text-sm text-[#6B6785]">
                                    {
                                      invoice.client
                                        .companyName
                                    }
                                  </p>
                                )}

                                {invoice.client?.email && (
                                  <p className="mt-1 max-w-[220px] truncate text-xs text-[#8B879F]">
                                    {invoice.client.email}
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Issue Date */}

                            <TableCell className="whitespace-nowrap text-sm text-[#4A4563]">
                              {formatDate(
                                invoice.issueDate
                              )}
                            </TableCell>

                            {/* Due Date */}

                            <TableCell className="whitespace-nowrap text-sm text-[#4A4563]">
                              {formatDate(
                                invoice.dueDate
                              )}
                            </TableCell>

                            {/* Amount */}

                            <TableCell className="whitespace-nowrap text-right">
                              <p className="font-semibold text-[#2B2640]">
                                {formatCurrency(
                                  invoice.grandTotal
                                )}
                              </p>
                            </TableCell>

                            {/* Status */}

                            <TableCell className="text-center">
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                                  invoice.status
                                )}`}
                              >
                                {invoice.status}
                              </span>
                            </TableCell>

                            {/* Actions */}

                            <TableCell className="px-6">
                              <div className="flex justify-end gap-2">
                                <Link
                                  to={`/invoices/${invoice._id}`}
                                  className={actionButton}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Link>

                                <Link
                                  to={`/invoices/edit/${invoice._id}`}
                                  className={actionButton}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      invoice._id
                                    )
                                  }
                                  className={deleteButton}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Desktop Table Footer */}

                <div className="border-t border-[#E8E6F2] bg-[#FBFAFE] px-6 py-3">
                  <p className="text-xs text-[#8B879F]">
                    Showing{" "}
                    <span className="font-semibold text-[#4A4563]">
                      {invoices.length}
                    </span>{" "}
                    {invoices.length === 1
                      ? "invoice"
                      : "invoices"}
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </MotionConfig>
  );
};

export default Invoices;
