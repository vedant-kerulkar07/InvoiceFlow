const escapeCSVValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const generateInvoiceCSV = (invoices) => {
  const headers = [
    "Invoice Number",
    "Client Name",
    "Company Name",
    "Client Email",
    "Issue Date",
    "Due Date",
    "Subtotal",
    "Tax Percentage",
    "Tax Amount",
    "Discount",
    "Grand Total",
    "Status",
  ];

  const rows = invoices.map((invoice) => [
    invoice.invoiceNumber,
    invoice.client?.name,
    invoice.client?.companyName,
    invoice.client?.email,

    invoice.issueDate
      ? new Date(invoice.issueDate).toLocaleDateString("en-IN")
      : "",

    invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString("en-IN")
      : "",

    invoice.subtotal ?? 0,
    invoice.taxPercentage ?? 0,
    invoice.taxAmount ?? 0,
    invoice.discount ?? 0,
    invoice.grandTotal ?? 0,
    invoice.status,
  ]);

  const csvRows = [
    headers,
    ...rows,
  ];

  return csvRows
    .map((row) =>
      row.map((value) => escapeCSVValue(value)).join(",")
    )
    .join("\n");
};