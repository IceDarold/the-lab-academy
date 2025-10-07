import api from '../lib/api';
import { AuthTokens, RegisterResult, User } from '../types/auth';

const mapAuthTokens = (data: any): AuthTokens => {
  if (!data || typeof data.access_token !== 'string') {
    throw new Error('Authentication response is missing access_token');
  }

  return {
    accessToken: data.access_token,
    tokenType: typeof data.token_type === 'string' ? data.token_type : 'bearer',
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    expiresAt: data.expires_at,
  };
};

export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  const response = await api.post('/v1/auth/login', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return mapAuthTokens(response.data);
};

export const register = async (
  fullName: string,
  email: string,
  password: string
): Promise<RegisterResult> => {
  const payload = {
    full_name: fullName,
    email,
    password,
  };

  const response = await api.post('/v1/auth/register', payload);
  const data = response.data;

  if (data?.status === 'pending_confirmation') {
    return { status: 'pending_confirmation' };
  }

  return {
    status: 'authenticated',
    tokens: mapAuthTokens(data),
  };
};

export const getMe = async (): Promise<User> => {
  const response = await api.get('/v1/auth/me');
  const data = response.data;

  if (!data) {
    throw new Error('Unable to load user profile');
  }

  return {
    id: data.user_id ?? data.id ?? '',
    fullName: data.full_name ?? data.fullName ?? '',
    email: data.email,
    role: data.role,
  };
};
export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await api.post('/v1/auth/check-email', { email });
  return response.data.exists;
};


export const logout = async (): Promise<void> => {
  // The reference API does not expose a logout endpoint.
  // If one becomes available, implement the call here.
  return Promise.resolve();
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/v1/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/v1/auth/reset-password', { token, newPassword });
};
