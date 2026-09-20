const API_URL = "http://localhost:5000/api";

// Create invoice
export const createInvoice = async (invoiceData) => {
  const response = await fetch(`${API_URL}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(invoiceData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create invoice");
  }

  return data;
};

// Get all invoices / Search / Filter invoices
export const getInvoices = async ({
  search = "",
  client = "",
  status = "",
  fromDate = "",
  toDate = "",
} = {}) => {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.append("search", search.trim());
  }

  if (client) {
    params.append("client", client);
  }

  if (status) {
    params.append("status", status);
  }

  if (fromDate) {
    params.append("fromDate", fromDate);
  }

  if (toDate) {
    params.append("toDate", toDate);
  }

  const queryString = params.toString();

  const response = await fetch(
    `${API_URL}/invoices${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch invoices");
  }

  return data;
};

// Get single invoice
export const getInvoiceById = async (id) => {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch invoice");
  }

  return data;
};

// Update invoice
export const updateInvoice = async (id, invoiceData) => {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(invoiceData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update invoice");
  }

  return data;
};

// Delete invoice
export const deleteInvoice = async (id) => {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete invoice");
  }

  return data;
};