import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  MotionConfig,
} from "framer-motion";

import Loading from "../../components/common/Loading";
import { getDashboard } from "../../services/dashboardService";

/* ---------- Animation variants ---------- */

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
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

/* ---------- Shared styles ---------- */

const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200";

const viewButton =
  "inline-flex items-center justify-center rounded-lg border border-[#E8E6F2] px-3 py-1.5 text-sm font-medium text-[#2B2640] transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const textLink =
  "rounded text-sm font-medium text-violet-700 transition-colors hover:text-violet-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

const cardClass =
  "rounded-2xl border border-[#E8E6F2] bg-white shadow-[0_1px_2px_rgba(43,38,64,0.04)]";

const headerCell =
  "px-6 py-3.5 text-xs font-medium text-[#6B6785]";

/* ---------- Dashboard ---------- */

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- Fetch dashboard ---------- */

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboard();

        setDashboard(data.dashboard || null);
      } catch (error) {
        setError(
          error.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ---------- Loading ---------- */

  if (loading) {
    return <Loading />;
  }

  /* ---------- Dashboard data ---------- */

  const totalClients = dashboard?.totalClients || 0;

  const totalInvoices = dashboard?.totalInvoices || 0;

  const paidInvoices = dashboard?.paidInvoices || 0;

  const unpaidInvoices = dashboard?.unpaidInvoices || 0;

  const overdueInvoices = dashboard?.overdueInvoices || 0;

  const totalRevenue = Number(
    dashboard?.totalRevenue || 0
  );

  const pendingAmount = Number(
    dashboard?.pendingAmount || 0
  );

  const recentInvoices =
    dashboard?.recentInvoices || [];

  /* ---------- Helpers ---------- */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
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

  /* ---------- UI ---------- */

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#6B6785]">
              Overview of your invoices and clients.
            </p>
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
              className={`${primaryButton} w-full`}
            >
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

        {/* Statistics */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >

          {/* Total Invoices */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5 sm:p-6`}
          >
            <p className="text-sm font-medium text-[#6B6785]">
              Total Invoices
            </p>

            <p className="mt-3 text-2xl font-bold text-[#2B2640] xl:text-3xl">
              {totalInvoices}
            </p>

            <p className="mt-2 text-xs text-[#6B6785]">
              All created invoices
            </p>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-[#2F1B5E] p-5 text-white shadow-lg shadow-violet-900/20 sm:p-6"
          >
            <p className="text-sm font-medium text-violet-200">
              Total Revenue
            </p>

            <p className="mt-3 break-words text-2xl font-bold xl:text-3xl">
              {formatCurrency(totalRevenue)}
            </p>

            <p className="mt-2 text-xs text-violet-300">
              Revenue from paid invoices
            </p>
          </motion.div>

          {/* Paid */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5 sm:p-6`}
          >
            <p className="text-sm font-medium text-[#6B6785]">
              Paid Invoices
            </p>

            <p className="mt-3 text-2xl font-bold text-teal-700 xl:text-3xl">
              {paidInvoices}
            </p>

            <p className="mt-2 text-xs text-[#6B6785]">
              Successfully paid invoices
            </p>
          </motion.div>

          {/* Pending */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5 sm:p-6`}
          >
            <p className="text-sm font-medium text-[#6B6785]">
              Pending Amount
            </p>

            <p className="mt-3 break-words text-2xl font-bold text-amber-600 xl:text-3xl">
              {formatCurrency(pendingAmount)}
            </p>

            <p className="mt-2 text-xs text-[#6B6785]">
              Unpaid and overdue amount
            </p>
          </motion.div>
        </motion.div>

        {/* Invoice Status Summary */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
        >
          {/* Paid */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B6785]">
                  Paid
                </p>

                <p className="mt-2 text-2xl font-bold text-teal-700">
                  {paidInvoices}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                ✓
              </div>
            </div>
          </motion.div>

          {/* Unpaid */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B6785]">
                  Unpaid
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {unpaidInvoices}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                !
              </div>
            </div>
          </motion.div>

          {/* Overdue */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B6785]">
                  Overdue
                </p>

                <p className="mt-2 text-2xl font-bold text-rose-600">
                  {overdueInvoices}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                !
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-2"
        >
          {/* Clients */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5 sm:p-6`}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2640]">
                  Clients
                </h2>

                <p className="mt-1 text-sm text-[#6B6785]">
                  Manage your clients and billing information.
                </p>
              </div>

              <Link
                to="/clients"
                className={textLink}
              >
                View Clients →
              </Link>
            </div>

            <div className="mt-6 rounded-xl bg-[#F7F6FB] p-5">
              <p className="text-3xl font-bold text-[#2B2640]">
                {totalClients}
              </p>

              <p className="mt-1 text-sm text-[#6B6785]">
                Total clients
              </p>
            </div>
          </motion.div>

          {/* Invoices */}
          <motion.div
            variants={itemVariants}
            className={`${cardClass} p-5 sm:p-6`}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div>
                <h2 className="text-lg font-semibold text-[#2B2640]">
                  Invoices
                </h2>

                <p className="mt-1 text-sm text-[#6B6785]">
                  Create and manage your invoices.
                </p>
              </div>

              <Link
                to="/invoices"
                className={textLink}
              >
                View Invoices →
              </Link>
            </div>

            <div className="mt-6 rounded-xl bg-[#F7F6FB] p-5">
              <p className="text-3xl font-bold text-[#2B2640]">
                {totalInvoices}
              </p>

              <p className="mt-1 text-sm text-[#6B6785]">
                Total invoices
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            delay: 0.3,
          }}
          className={`${cardClass} mt-6 overflow-hidden sm:mt-8`}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#E8E6F2] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-[#2B2640]">
                Recent Invoices
              </h2>

              <p className="mt-1 text-sm text-[#6B6785]">
                Your latest invoices.
              </p>
            </div>

            <Link
              to="/invoices"
              className={textLink}
            >
              View All
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="px-6 py-14 text-center">
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

              <h3 className="mt-4 text-base font-semibold text-[#2B2640]">
                No invoices yet
              </h3>

              <p className="mt-2 text-sm text-[#6B6785]">
                Create your first invoice to start tracking your billing.
              </p>

              <Link
                to="/invoices/create"
                className={`${primaryButton} mt-5`}
              >
                Create Invoice
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-[#F0EEF7] md:hidden"
              >
                {recentInvoices.map((invoice) => (
                  <motion.li
                    key={invoice._id}
                    variants={rowVariants}
                    className="p-5"
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

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <p className="text-sm text-[#6B6785]">
                        {formatDate(invoice.issueDate)}
                      </p>

                      <p className="text-base font-semibold text-[#2B2640]">
                        {formatCurrency(invoice.grandTotal)}
                      </p>
                    </div>

                    <Link
                      to={`/invoices/${invoice._id}`}
                      className={`${viewButton} mt-4 w-full`}
                    >
                      View
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Tablet / Desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b border-[#E8E6F2] bg-[#FBFAFE]">
                    <tr>
                      <th
                        className={`${headerCell} text-left`}
                      >
                        Invoice
                      </th>

                      <th
                        className={`${headerCell} text-left`}
                      >
                        Client
                      </th>

                      <th
                        className={`${headerCell} text-left`}
                      >
                        Issue Date
                      </th>

                      <th
                        className={`${headerCell} text-right`}
                      >
                        Amount
                      </th>

                      <th
                        className={`${headerCell} text-center`}
                      >
                        Status
                      </th>

                      <th
                        className={`${headerCell} text-right`}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <motion.tbody
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-[#F0EEF7]"
                  >
                    {recentInvoices.map((invoice) => (
                      <motion.tr
                        key={invoice._id}
                        variants={rowVariants}
                        className="transition-colors hover:bg-[#FBFAFE]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#2B2640]">
                            {invoice.invoiceNumber}
                          </p>

                          <p className="mt-1 text-xs text-[#6B6785]">
                            {itemsLabel(invoice)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-[#2B2640]">
                            {invoice.client?.name || "—"}
                          </p>

                          {invoice.client?.companyName && (
                            <p className="mt-1 text-sm text-[#6B6785]">
                              {invoice.client.companyName}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#4A4563]">
                          {formatDate(invoice.issueDate)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold text-[#2B2640]">
                            {formatCurrency(invoice.grandTotal)}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClass(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/invoices/${invoice._id}`}
                            className={viewButton}
                          >
                            View
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
};

export default Dashboard;