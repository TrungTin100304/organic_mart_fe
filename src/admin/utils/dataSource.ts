export type AdminDataSource = "api" | "mock";

export interface AdminDataResult<T> {
  data: T;
  source: AdminDataSource;
  error?: string;
}

type FallbackValue<T> = T | (() => T);

const fallbackData = <T>(fallback: FallbackValue<T>) =>
  typeof fallback === "function" ? (fallback as () => T)() : fallback;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Không thể kết nối API.";

export const isAdminMockEnabled = () =>
  import.meta.env?.VITE_ENABLE_ADMIN_MOCKS === "true";

export async function loadAdminDataWithFallback<T>(
  loader: () => Promise<T>,
  fallback: FallbackValue<T>,
  allowFallback = isAdminMockEnabled(),
): Promise<AdminDataResult<T>> {
  try {
    return {
      data: await loader(),
      source: "api",
    };
  } catch (error) {
    if (!allowFallback) {
      throw error;
    }

    return {
      data: fallbackData(fallback),
      source: "mock",
      error: errorMessage(error),
    };
  }
}

export const sourceLabel = (source: AdminDataSource) =>
  source === "api" ? "từ API" : "dữ liệu mẫu";
