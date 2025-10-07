import api from '../lib/api';
import { User } from '../types/auth';

/**
 * Logs in a user.
 * @returns A promise that resolves to an object containing the user and a JWT token.
 */
export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Registers a new user.
 * @returns A promise that resolves to an object containing the new user and a JWT token.
 */
export const register = async (fullName: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await api.post('/auth/register', { fullName, email, password });
  return response.data;
};

/**
 * Fetches the current user's data based on the authentication token.
 * @returns A promise that resolves to the user object.
 */
export const getMe = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
};

/**
 * Logs out the user. In a real application, this could also invalidate the token on the server.
 */
export const logout = async (): Promise<void> => {
  // Example: await api.post('/auth/logout');
  console.log('Logging out...');
  return Promise.resolve();
};
