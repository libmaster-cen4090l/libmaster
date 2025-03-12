import axios from "axios";

// Determine the base URL based on environment
const getBaseUrl = () => {
  // In production, API requests are proxied through /api
  if (import.meta.env.PROD) {
    return '/api/';
  }
  // In development, point directly to the Django server
  return 'http://127.0.0.1:8000/';
}

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 5000, // Increased from 1000ms for better reliability
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// (Dylan) For Reservations page
// Create a specialized instance for room operations
export const roomApi = axios.create({
    baseURL: import.meta.env.PROD ? '/' : 'http://127.0.0.1:8000/',  // No /api/ prefix
    timeout: 5000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default api;
