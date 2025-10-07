import { User } from '../types/auth';

export const login = async (email: string, password: string): Promise<User> => {
  console.log('Logging in with:', email, password);
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate an API response
  if (email === 'test@example.com' && password === 'password') {
    return {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export const register = async (fullName: string, email: string, password: string): Promise<User> => {
  console.log('Registering with:', fullName, email, password);
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate a successful response from the API
  // In a real application, this could be a check to see if the email address is busy
  return {
    id: '2', // New ID
    fullName: fullName,
    email: email,
  };
};

export const logout = async (): Promise<void> => {
  console.log('Logging out...');
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real application, this would be a request to delete the token
};