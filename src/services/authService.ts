import apiClient from '@/lib/apiClient';

import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<{ user: User }> {
    const response = await apiClient.post<{ user: User }>(
      '/auth/email/register',
      data
    );
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/email/login',
      data
    );

    // Save token to cookies/localStorage
    if (response.data.token) {
      apiClient.saveToken(response.data.token);
    }

    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    apiClient.removeToken();
  },
};

export default authService;
