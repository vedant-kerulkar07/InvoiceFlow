const API_URL = "http://localhost:5000/api";

// Create client
export const createClient = async (clientData) => {
  const response = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(clientData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create client");
  }

  return data;
};

// Get all clients / Search clients
export const getClients = async (search = "") => {
  const query = search.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";

  const response = await fetch(`${API_URL}/clients${query}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch clients");
  }

  return data;
};

// Get single client
export const getClientById = async (id) => {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch client");
  }

  return data;
};

// Update client
export const updateClient = async (id, clientData) => {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(clientData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update client");
  }

  return data;
};

// Delete client
export const deleteClient = async (id) => {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete client");
  }

  return data;
};