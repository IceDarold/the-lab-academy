import axios from 'axios';

// This would typically come from an environment variable like process.env.NEXT_PUBLIC_API_URL
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

/**
 * Interceptor to handle API responses. This is a good place to implement
 * global error handling, such as logging out the user on a 401 Unauthorized response.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can add global error handling here. For example:
    if (error.response && error.response.status === 401) {
      // If we get a 401, it means the token is invalid or expired.
      // We could trigger a logout action here.
      console.error("Authentication Error: Please log in again.", error);
    }
    // The error is passed along to be caught by the service/component.
    return Promise.reject(error);
  }
);

export default api;
