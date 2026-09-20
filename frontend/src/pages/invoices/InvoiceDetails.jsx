import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  motion,
  AnimatePresence,
  MotionConfig,
} from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Building2,
  Mail,
  Phone,
  ReceiptText,
  Trash2,
  Pencil,
  FileText,
  IndianRupee,
  MapPin,
  Hash,
} from "lucide-react";

import {
  getInvoiceById,
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
      delayChildren: 0.1,
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

/* ---------- Shared styles ---------- */

const backLink =
  "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-[#6B6785] transition-colors hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const editButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E6F2] bg-white px-4 py-2.5 text-sm font-medium text-[#2B2640] shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100";

const deleteButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50";

const metaLabel =
  "text-xs font-medium uppercase tracking-wide text-[#8B879F]";

/* ---------- Component ---------- */

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  /* ---------- Fetch invoice ---------- */

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

  /* ---------- Delete invoice ---------- */

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

      navigate("/invoices", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.message || "Failed to delete invoice"
      );

      setDeleting(false);
    }
  };

  /* ---------- Format helpers ---------- */

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

  /* ---------- Loading ---------- */

  if (loading) {
    return <Loading />;
  }

  /* ---------- Error ---------- */

  if (error && !invoice) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9FD]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/invoices"
            className={backLink}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>

          <motion.div
            role="alert"
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
            className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ReceiptText className="h-5 w-5" />
            </div>

            <h1 className="mt-4 text-lg font-semibold text-rose-700">
              Unable to load invoice
            </h1>

            <p className="mt-2 text-sm text-rose-600">
              {error}
            </p>

            <Link
              to="/invoices"
              className={`${primaryButton} mt-6`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const client = invoice.client || {};

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9FD]">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* =====================================================
              PAGE HEADER
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
            }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              {/* Heading */}

              <div>
                <Link
                  to="/invoices"
                  className={backLink}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Invoices
                </Link>

                <div className="mt-4 flex items-start gap-3">
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:flex">
                    <ReceiptText className="h-5 w-5" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
                      Invoice Details
                    </h1>

                    <p className="mt-1 text-sm leading-6 text-[#6B6785]">
                      View complete invoice and billing
                      information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Link
                  to={`/invoices/edit/${invoice._id}`}
                  className={editButton}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className={deleteButton}
                >
                  <Trash2 className="h-4 w-4" />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              ERROR
          ====================================================== */}

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

          {/* =====================================================
              INVOICE CARD
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              ease: "easeOut",
              delay: 0.05,
            }}
            className="overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04),0_16px_40px_-20px_rgba(91,33,182,0.18)]"
          >

            {/* =================================================
                INVOICE HEADER
            ================================================== */}

            <div className="border-b border-[#E8E6F2] px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                {/* Invoice Number */}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <FileText className="h-4 w-4" />
                    </div>

                    <p className="text-sm font-medium text-[#6B6785]">
                      Invoice
                    </p>
                  </div>

                  <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
                    {invoice.invoiceNumber}
                  </h2>
                </div>

                {/* Status */}

                <div className="sm:text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>

              {/* Invoice Meta */}

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#EEEAF7] bg-[#FBFAFE] p-4">
                  <div className="flex items-center gap-2 text-[#8B879F]">
                    <CalendarDays className="h-4 w-4" />

                    <p className={metaLabel}>
                      Issue Date
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#2B2640]">
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEEAF7] bg-[#FBFAFE] p-4">
                  <div className="flex items-center gap-2 text-[#8B879F]">
                    <CalendarDays className="h-4 w-4" />

                    <p className={metaLabel}>
                      Due Date
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#2B2640]">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#EEEAF7] bg-[#FBFAFE] p-4">
                  <div className="flex items-center gap-2 text-[#8B879F]">
                    <Hash className="h-4 w-4" />

                    <p className={metaLabel}>
                      Created
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#2B2640]">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                CLIENT INFORMATION
            ================================================== */}

            <div className="border-b border-[#E8E6F2] px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Building2 className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#2B2640]">
                    Bill To
                  </h3>

                  <p className="text-xs text-[#8B879F]">
                    Client billing information
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#E8E6F2] bg-[#F9F8FC] p-4 sm:p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-[#2B2640]">
                    {client.name || "—"}
                  </p>

                  {client.companyName && (
                    <p className="text-sm text-[#6B6785]">
                      {client.companyName}
                    </p>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Email */}

                  <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#EEEAF7]">
                    <div className="flex items-center gap-2 text-violet-600">
                      <Mail className="h-4 w-4" />

                      <p className={metaLabel}>
                        Email
                      </p>
                    </div>

                    <p className="mt-2 break-words text-sm text-[#4A4563]">
                      {client.email || "—"}
                    </p>
                  </div>

                  {/* Phone */}

                  <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#EEEAF7]">
                    <div className="flex items-center gap-2 text-violet-600">
                      <Phone className="h-4 w-4" />

                      <p className={metaLabel}>
                        Phone
                      </p>
                    </div>

                    <p className="mt-2 break-words text-sm text-[#4A4563]">
                      {client.phone || "—"}
                    </p>
                  </div>

                  {/* GST */}

                  <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#EEEAF7]">
                    <div className="flex items-center gap-2 text-violet-600">
                      <Hash className="h-4 w-4" />

                      <p className={metaLabel}>
                        GST Number
                      </p>
                    </div>

                    <p className="mt-2 break-words text-sm text-[#4A4563]">
                      {client.gstNumber || "—"}
                    </p>
                  </div>

                  {/* Address */}

                  <div className="min-w-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#EEEAF7]">
                    <div className="flex items-center gap-2 text-violet-600">
                      <MapPin className="h-4 w-4" />

                      <p className={metaLabel}>
                        Billing Address
                      </p>
                    </div>

                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-[#4A4563]">
                      {client.billingAddress || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                INVOICE ITEMS
            ================================================== */}

            <div className="border-b border-[#E8E6F2] px-5 py-6 sm:px-8 sm:py-7">

              {/* Section Header */}

              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <ReceiptText className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#2B2640]">
                      Invoice Items
                    </h3>

                    <p className="text-xs text-[#8B879F]">
                      Products and services included in this invoice
                    </p>
                  </div>
                </div>

                <p className="text-xs font-medium text-[#8B879F] sm:pr-1">
                  {invoice.items?.length || 0}{" "}
                  {invoice.items?.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>

              {/* Mobile Item Cards */}

              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-5 space-y-3 md:hidden"
              >
                {invoice.items?.map(
                  (item, index) => (
                    <motion.li
                      key={index}
                      variants={rowVariants}
                      className="rounded-xl border border-[#E8E6F2] bg-[#FBFAFE] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-[#2B2640]">
                            {item.description}
                          </p>

                          <p className="mt-1 text-xs text-[#8B879F]">
                            Item #{index + 1}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-[#2B2640]">
                          {formatCurrency(
                            item.amount
                          )}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E8E6F2] pt-3">
                        <div>
                          <p className={metaLabel}>
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#4A4563]">
                            {item.quantity}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={metaLabel}>
                            Rate
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#4A4563]">
                            {formatCurrency(item.rate)}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  )
                )}
              </motion.ul>

              {/* Desktop / Tablet shadcn Table */}

              <div className="mt-5 hidden overflow-hidden rounded-2xl border border-[#E8E6F2] md:block">
                <div className="overflow-x-auto">
                  <Table className="min-w-[720px]">

                    <TableHeader>
                      <TableRow className="border-[#E8E6F2] bg-[#FBFAFE] hover:bg-[#FBFAFE]">

                        <TableHead className="h-12 px-5 text-left text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Description
                        </TableHead>

                        <TableHead className="h-12 text-center text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Quantity
                        </TableHead>

                        <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Rate
                        </TableHead>

                        <TableHead className="h-12 px-5 text-right text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Amount
                        </TableHead>

                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {invoice.items?.map(
                        (item, index) => (
                          <motion.tr
                            key={index}
                            variants={rowVariants}
                            initial="hidden"
                            animate="show"
                            transition={{
                              duration: 0.3,
                              delay: index * 0.05,
                            }}
                            className="border-[#F0EEF7] transition-colors hover:bg-[#FCFBFE]"
                          >
                            <TableCell className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                  <FileText className="h-3.5 w-3.5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="break-words text-sm font-medium text-[#2B2640]">
                                    {item.description}
                                  </p>

                                  <p className="mt-0.5 text-xs text-[#8B879F]">
                                    Item #{index + 1}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-center text-sm font-medium text-[#4A4563]">
                              {item.quantity}
                            </TableCell>

                            <TableCell className="text-right text-sm text-[#4A4563]">
                              {formatCurrency(
                                item.rate
                              )}
                            </TableCell>

                            <TableCell className="px-5 text-right text-sm font-semibold text-[#2B2640]">
                              {formatCurrency(
                                item.amount
                              )}
                            </TableCell>
                          </motion.tr>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Hint */}

              <div className="mt-3 text-center text-xs text-[#9A96AB] md:hidden">
                Item details are optimized for mobile viewing.
              </div>
            </div>

            {/* =================================================
                INVOICE SUMMARY
            ================================================== */}

            <div className="px-5 py-6 sm:px-8 sm:py-7">
              <div className="ml-auto w-full max-w-md">

                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <IndianRupee className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#2B2640]">
                      Invoice Summary
                    </h3>

                    <p className="text-xs text-[#8B879F]">
                      Final billing breakdown
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8E6F2] bg-[#FBFAFE] p-4 sm:p-5">
                  <div className="space-y-4">

                    {/* Subtotal */}

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#6B6785]">
                        Subtotal
                      </span>

                      <span className="font-medium text-[#2B2640]">
                        {formatCurrency(
                          invoice.subtotal
                        )}
                      </span>
                    </div>

                    {/* Tax */}

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#6B6785]">
                        Tax (
                        {invoice.taxPercentage || 0}
                        %)
                      </span>

                      <span className="font-medium text-[#2B2640]">
                        {formatCurrency(
                          invoice.taxAmount
                        )}
                      </span>
                    </div>

                    {/* Discount */}

                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-[#6B6785]">
                        Discount
                      </span>

                      <span className="font-medium text-rose-600">
                        -{" "}
                        {formatCurrency(
                          invoice.discount
                        )}
                      </span>
                    </div>

                    <div className="border-t border-[#E8E6F2]" />

                    {/* Grand Total */}

                    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#2F1B5E] px-4 py-4 text-white shadow-lg shadow-violet-900/20 sm:px-5">
                      <div>
                        <p className="text-xs font-medium text-violet-200">
                          Total Payable
                        </p>

                        <span className="mt-0.5 block text-base font-semibold sm:text-lg">
                          Grand Total
                        </span>
                      </div>

                      <span className="break-words text-right text-xl font-bold sm:text-2xl">
                        {formatCurrency(
                          invoice.grandTotal
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
};

export default InvoiceDetails;
