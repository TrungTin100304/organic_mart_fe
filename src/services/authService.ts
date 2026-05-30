import type {
  AuthResponse,
  SignupRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types/auth";
import { apiRequest, normalizeRole, toJsonBody } from "./apiClient";

const normalizeAuthResponse = (response: AuthResponse): AuthResponse => ({
  ...response,
  role: normalizeRole(response.role),
});

const post = async <T, U = unknown>(endpoint: string, data: U, requireAuth = false): Promise<T> =>
  apiRequest<T>(`/auth${endpoint}`, {
    method: "POST",
    body: toJsonBody(data),
    requireAuth,
  });

export const signup = async (data: SignupRequest) => normalizeAuthResponse(await post<AuthResponse>("/signup", data));
export const login = async (data: LoginRequest) => normalizeAuthResponse(await post<AuthResponse>("/login", data));
export const refresh = async (data: RefreshTokenRequest) => normalizeAuthResponse(await post<AuthResponse>("/refresh", data));
export const logout = (data: RefreshTokenRequest) => post<string>("/logout", data, true);
export const forgotPassword = (data: ForgotPasswordRequest) => post<string>("/forgot-password", data);
export const resetPassword = (data: ResetPasswordRequest) => post<string>("/reset-password", data);
