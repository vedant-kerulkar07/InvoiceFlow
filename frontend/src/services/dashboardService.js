const API_URL = "http://localhost:5000/api";

// Get dashboard statistics
export const getDashboard = async () => {
  const response = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch dashboard statistics"
    );
  }

  return data;
};