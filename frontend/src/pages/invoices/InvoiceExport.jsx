import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { generateInvoiceCSV } from "../../utils/generateInvoiceCSV";
import { getInvoicesForExport } from "../../services/invoiceExport.service";

const InvoiceExport = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getInvoicesForExport();

        setInvoices(data.invoices || []);
      } catch (error) {
        setError(error.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      setError("");

      const csvContent = generateInvoiceCSV(invoices);

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "invoice-data.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);

      setError("Failed to export invoices as CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalInvoices = invoices.length;

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.grandTotal || 0),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  ).length;

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "Unpaid" ||
      invoice.status === "Overdue"
  ).length;

  const getStatusStyles = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

      case "Overdue":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";

      case "Unpaid":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

      case "Draft":
        return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";

      default:
        return "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF9FD]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            {/* Title */}
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <FileSpreadsheet className="h-5 w-5" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#2B2640] sm:text-3xl">
                Export Invoices
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6785] sm:text-base">
                View your invoice records and download them as
                a CSV file for reporting, analysis, or backup.
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/invoices"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E8E6F2] bg-white px-4 text-sm font-medium text-[#2B2640] shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
              </Link>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={
                  loading ||
                  invoices.length === 0 ||
                  isExporting
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />

                {isExporting
                  ? "Exporting..."
                  : "Export CSV"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-xl border border-[#E8E6F2] bg-white"
                />
              ))}
            </div>

            <div className="h-80 animate-pulse rounded-xl border border-[#E8E6F2] bg-white" />
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[#E8E6F2] bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#6B6785]">
                  Total Invoices
                </p>

                <p className="mt-2 text-2xl font-bold text-[#2B2640]">
                  {totalInvoices}
                </p>

                <p className="mt-1 text-xs text-[#8B879F]">
                  Available for export
                </p>
              </div>

              <div className="rounded-xl border border-[#E8E6F2] bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#6B6785]">
                  Total Amount
                </p>

                <p className="mt-2 truncate text-2xl font-bold text-[#2B2640]">
                  ₹{totalAmount.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-[#8B879F]">
                  Across all invoices
                </p>
              </div>

              <div className="rounded-xl border border-[#E8E6F2] bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#6B6785]">
                  Paid
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {paidInvoices}
                </p>

                <p className="mt-1 text-xs text-[#8B879F]">
                  Paid invoices
                </p>
              </div>

              <div className="rounded-xl border border-[#E8E6F2] bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-[#6B6785]">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {pendingInvoices}
                </p>

                <p className="mt-1 text-xs text-[#8B879F]">
                  Unpaid or overdue
                </p>
              </div>
            </div>

            {/* Empty State */}
            {invoices.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#DCD9E8] bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-[#2B2640]">
                  No invoices found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B6785]">
                  Create your first invoice to start exporting
                  invoice data as a CSV file.
                </p>

                <Link
                  to="/invoices/create"
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  Create Invoice
                </Link>
              </div>
            )}

            {/* Invoice Table */}
            {invoices.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#E8E6F2] bg-white shadow-sm">
                {/* Table Header */}
                <div className="flex flex-col gap-1 border-b border-[#E8E6F2] px-5 py-4 sm:px-6">
                  <h2 className="text-base font-semibold text-[#2B2640]">
                    Invoice Data
                  </h2>

                  <p className="text-sm text-[#6B6785]">
                    {totalInvoices}{" "}
                    {totalInvoices === 1
                      ? "invoice"
                      : "invoices"}{" "}
                    available
                  </p>
                </div>

                {/* Responsive Table */}
                <div className="overflow-x-auto">
                  <Table className="min-w-[850px]">
                    <TableHeader>
                      <TableRow className="border-[#E8E6F2] bg-[#FAF9FD] hover:bg-[#FAF9FD]">
                        <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wider text-[#6B6785] sm:px-6">
                          Invoice
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Client
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Issue Date
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Due Date
                        </TableHead>

                        <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Total
                        </TableHead>

                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-[#6B6785]">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow
                          key={invoice._id}
                          className="border-[#F0EEF5] transition-colors hover:bg-[#FAF9FD]"
                        >
                          {/* Invoice */}
                          <TableCell className="px-5 py-4 sm:px-6">
                            <div className="font-semibold text-[#2B2640]">
                              {invoice.invoiceNumber || "-"}
                            </div>

                            <div className="mt-0.5 text-xs text-[#8B879F]">
                              Invoice
                            </div>
                          </TableCell>

                          {/* Client */}
                          <TableCell>
                            <div className="min-w-[180px]">
                              <p className="font-medium text-[#2B2640]">
                                {invoice.client?.name || "-"}
                              </p>

                              {invoice.client?.companyName && (
                                <p className="mt-0.5 text-xs text-[#8B879F]">
                                  {invoice.client.companyName}
                                </p>
                              )}

                              {invoice.client?.email && (
                                <p className="mt-1 text-xs text-[#6B6785]">
                                  {invoice.client.email}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          {/* Issue Date */}
                          <TableCell className="whitespace-nowrap text-[#4F4A67]">
                            {invoice.issueDate
                              ? new Date(
                                  invoice.issueDate
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </TableCell>

                          {/* Due Date */}
                          <TableCell className="whitespace-nowrap text-[#4F4A67]">
                            {invoice.dueDate
                              ? new Date(
                                  invoice.dueDate
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </TableCell>

                          {/* Total */}
                          <TableCell className="whitespace-nowrap text-right">
                            <span className="font-semibold text-[#2B2640]">
                              ₹
                              {Number(
                                invoice.grandTotal || 0
                              ).toFixed(2)}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                                invoice.status
                              )}`}
                            >
                              {invoice.status || "Unknown"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Hint */}
                <div className="border-t border-[#E8E6F2] bg-[#FAF9FD] px-5 py-3 text-center text-xs text-[#8B879F] sm:hidden">
                  Swipe horizontally to view all invoice
                  details
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceExport;