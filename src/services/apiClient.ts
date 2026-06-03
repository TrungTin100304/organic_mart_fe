import type { Role } from "../types/user";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  skipRefresh?: boolean;
}

const DEFAULT_API_BASE_URL = "https://organic-mart-be-1.onrender.com/api/v1";

const getConfiguredBaseUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  return viteEnv?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
};

export const getApiBaseUrl = (value = getConfiguredBaseUrl()) => value.replace(/\/+$/, "");

const getAccessToken = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
  } catch {
    // Storage may be unavailable in tests or restricted browser contexts.
  }
};

const getRefreshToken = () => {
  try {
    return localStorage.getItem("refreshToken");
  } catch {
    return null;
  }
};

const storeAuthTokens = (auth: { accessToken: string; refreshToken: string; email?: string; role?: string }) => {
  try {
    localStorage.setItem("accessToken", auth.accessToken);
    localStorage.setItem("refreshToken", auth.refreshToken);
    if (auth.email) localStorage.setItem("userEmail", auth.email);
    if (auth.role) localStorage.setItem("userRole", normalizeRole(auth.role));
  } catch {
    // Storage may be unavailable in tests or restricted browser contexts.
  }
};

const joinUrl = (baseUrl: string, endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl(baseUrl)}${cleanEndpoint}`;
};

export const normalizeRole = (role?: string | null): Role => {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "ROLE_ADMIN" || normalized === "ADMIN") return "ROLE_ADMIN";
  return "ROLE_USER";
};

export const isAdminRole = (role?: string | null) => normalizeRole(role) === "ROLE_ADMIN";

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  baseUrl = getConfiguredBaseUrl()
): Promise<T> {
  const { requireAuth = false, skipRefresh = false, headers, body, ...init } = options;
  const token = getAccessToken();

  if (requireAuth && !token) {
    throw new Error("Vui lòng đăng nhập để tiếp tục.");
  }

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers instanceof Headers ? Object.fromEntries(headers.entries()) : (headers as Record<string, string> | undefined)),
  };

  if (body && !(body instanceof FormData) && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(joinUrl(baseUrl, endpoint), {
    ...init,
    body,
    headers: requestHeaders,
    credentials: "include",
  });

  const text = await response.text();
  // Defensive JSON parse: some servers may return the literal string 'undefined' or
  // a non-JSON body which would cause JSON.parse to throw. Attempt to parse only
  // when the text looks like JSON; otherwise fall back to null and log a warning
  // for easier debugging.
  let payload: any = null;
  if (text) {
    const trimmed = String(text).trim();
    if (trimmed && trimmed !== "undefined" && trimmed !== "null") {
      try {
        payload = JSON.parse(trimmed);
      } catch (e) {
        // Not valid JSON — keep payload as null but surface the raw text to console
        // to help debugging server responses during development.
        // eslint-disable-next-line no-console
        console.warn("apiClient: response is not valid JSON, raw text:", trimmed, e);
      }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !skipRefresh && getRefreshToken()) {
      const refreshed = await refreshAccessToken(baseUrl);
      if (refreshed) {
        return apiRequest<T>(endpoint, { ...options, skipRefresh: true }, baseUrl);
      }
    }

    if (response.status === 401 || response.status === 403) {
      clearAuthStorage();
    }
    throw new Error(payload?.message || payload?.error || `API request failed (${response.status})`);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export const toJsonBody = <T>(data: T) => JSON.stringify(data);

async function refreshAccessToken(baseUrl: string) {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(joinUrl(baseUrl, "/auth/refresh"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  const text = await response.text();
  let payload: any = null;
  if (text) {
    const trimmed = String(text).trim();
    if (trimmed && trimmed !== "undefined" && trimmed !== "null") {
      try {
        payload = JSON.parse(trimmed);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("refreshAccessToken: response is not valid JSON, raw text:", trimmed, e);
      }
    }
  }

  if (!response.ok) {
    clearAuthStorage();
    return false;
  }

  const auth = payload?.data || payload;
  if (!auth?.accessToken || !auth?.refreshToken) return false;
  storeAuthTokens(auth);
  return true;
}
