import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === "development" ?  "http://localhost:8000/api" : "/api",
  withCredentials: true,
  timeout: 10000,
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add loading indicators or headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Format successful responses
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  },
  (error) => {
    // Format error responses
    const formattedError = {
      success: false,
      message: error.response?.data?.message || "Network Error",
      status: error.response?.status || 500,
      data: error.response?.data,
    };
    
    // Handle specific status codes
    if (error.code === "ECONNABORTED") {
      formattedError.message = "Request timeout. Please try again.";
    }
    
    return Promise.reject(formattedError);
  }
);