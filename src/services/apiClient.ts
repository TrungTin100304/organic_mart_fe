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

const DEFAULT_API_BASE_URL = "https://organic-mart-be.onrender.com/api/v1";

export const resolveApiBaseUrl = ({
  baseUrl,
  isDev = false,
}: {
  baseUrl?: string;
  isDev?: boolean;
}) => {
  const configuredBaseUrl = baseUrl?.trim();

  if (configuredBaseUrl?.startsWith("http")) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (isDev && configuredBaseUrl?.startsWith("/")) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  return DEFAULT_API_BASE_URL;
};

const getConfiguredBaseUrl = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, any> }).env;

  return resolveApiBaseUrl({
    baseUrl: typeof viteEnv?.VITE_API_BASE_URL === "string" ? viteEnv.VITE_API_BASE_URL : undefined,
    isDev: Boolean(viteEnv?.DEV),
  });
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
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
};

const getInfrastructureErrorMessage = (status: number, text: string) => {
  const normalizedText = text.toLowerCase();

  if (
    normalizedText.includes("gemini")
    && (
      status === 429
      || normalizedText.includes("429 too many requests")
      || normalizedText.includes("quota exceeded")
      || normalizedText.includes("resource_exhausted")
    )
  ) {
    return "Dịch vụ tạo thực đơn AI đã hết hạn mức sử dụng. Vui lòng thử lại sau hoặc liên hệ quản trị viên.";
  }

  if (status === 503 && normalizedText.includes("service has been suspended")) {
    return "Backend Render đang bị tạm ngưng. Hãy resume hoặc redeploy service trên Render.";
  }

  if (status === 503) {
    return "Backend hiện không khả dụng (503). Vui lòng kiểm tra trạng thái service trên Render.";
  }

  return null;
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

  let response: Response;
  try {
    response = await fetch(joinUrl(baseUrl, endpoint), {
      ...init,
      body,
      headers: requestHeaders,
      credentials: "include",
    });
  } catch (err) {
    if (typeof window !== "undefined") {
      const isCors = err instanceof TypeError && err.message.toLowerCase().includes("fetch");
      const msg = isCors
        ? "CORS error — kiểm tra backend CORS config hoặc backend có đang chạy không."
        : `Network error: ${err instanceof Error ? err.message : String(err)}`;
      // eslint-disable-next-line no-console
      console.error(`[apiClient] NETWORK ERROR ${endpoint}`, err);
      throw new Error(msg);
    }
    throw err;
  }

  const text = await response.text();
  // Defensive JSON parse: some servers may return the literal string 'undefined' or
  // a non-JSON body which would cause JSON.parse to throw. Attempt to parse only
  // when the text looks like JSON; otherwise fall back to null and log a warning
  // for easier debugging.
  let payload: any = null;
  if (text) {
    const trimmed = String(text).trim();
    const contentType = response.headers.get("Content-Type") || "";
    const looksLikeJson = contentType.includes("application/json")
      || trimmed.startsWith("{")
      || trimmed.startsWith("[");

    if (looksLikeJson && trimmed && trimmed !== "undefined" && trimmed !== "null") {
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

    if (response.status === 401) {
      clearAuthStorage();
    }

    const message = getInfrastructureErrorMessage(response.status, text)
      || payload?.message
      || payload?.error
      || payload
      || `API request failed (${response.status})`;
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error(`[apiClient] ${response.status} ${endpoint}`, { payload, raw: text });
    }
    throw new Error(typeof message === "string" ? message : `API request failed (${response.status})`);
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
