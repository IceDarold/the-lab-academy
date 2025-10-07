import api from '../lib/api';
import { AuthResponse, User } from '../types/auth';

const normalizeAuthResponse = (data: any): AuthResponse => {
  if (!data) {
    throw new Error('Empty authentication response');
  }

  const user = data.user as User | undefined;
  const accessToken = data.accessToken ?? data.token;

  if (!user || !accessToken) {
    throw new Error('Authentication response missing required fields');
  }

  return {
    user,
    accessToken,
    refreshToken: data.refreshToken ?? data.refresh_token,
    expiresIn: data.expiresIn ?? data.expires_in,
    expiresAt: data.expiresAt ?? data.expires_at,
  };
};

/**
 * Logs in a user.
 * @returns A promise that resolves to an object containing the user and a JWT token.
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return normalizeAuthResponse(response.data);
};

/**
 * Registers a new user.
 * @returns A promise that resolves to an object containing the new user and a JWT token.
 */
export const register = async (
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { fullName, email, password });
  return normalizeAuthResponse(response.data);
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
export const logout = async (refreshToken?: string | null): Promise<void> => {
  try {
    await api.post('/auth/logout', { refreshToken });
  } catch (error) {
    // Swallow expected network errors — manual logout should still complete client-side.
    // eslint-disable-next-line no-console
    console.warn('Logout request failed', error);
  }
};
