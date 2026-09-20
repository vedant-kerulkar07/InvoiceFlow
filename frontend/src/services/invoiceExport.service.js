const API_URL = "http://localhost:5000/api";

// Get invoices for export
export const getInvoicesForExport = async () => {
  const response = await fetch(`${API_URL}/invoice-export`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch invoices for export"
    );
  }

  return data;
};