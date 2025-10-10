export interface User {
  id: string;
  fullName: string;
  email: string;
  role?: 'user' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  refreshToken?: string;
  expiresIn?: number;
  expiresAt?: number;
}

export type RegisterResult =
  | { status: 'authenticated'; tokens: AuthTokens }
  | { status: 'pending_confirmation' };

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkEmail: (email: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<RegisterResult>;
}
