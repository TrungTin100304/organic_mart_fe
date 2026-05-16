import type {
  AuthResponse,
  ApiResponse,
  SignupRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/auth';

const API_URL = 'http://localhost:8080/api/v1/auth';

const post = async <T, U = any>(endpoint: string, data: U): Promise<ApiResponse<T>> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'API Request Failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Ignore JSON parse error if response is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const signup = (data: SignupRequest) => post<AuthResponse>('/signup', data);
export const login = (data: LoginRequest) => post<AuthResponse>('/login', data);
export const refresh = (data: RefreshTokenRequest) => post<AuthResponse>('/refresh', data);
export const logout = (data: RefreshTokenRequest) => post<string>('/logout', data);
export const forgotPassword = (data: ForgotPasswordRequest) => post<string>('/forgot-password', data);
export const resetPassword = (data: ResetPasswordRequest) => post<string>('/reset-password', data);
