const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

const TOKEN_KEY = "hairbyoma_token";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

type ApiError = Error & {
  status: number;
  data: unknown;
};

export const tokenStorage = {
  get: () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(TOKEN_KEY)
      : null,

  set: (token: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clear: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  },
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  const { body, auth = true, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = tokenStorage.get();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
    {
      ...requestOptions,
      headers: requestHeaders,
      ...(body === undefined
        ? {}
        : {
            body: body instanceof FormData ? body : JSON.stringify(body),
          }),
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Something went wrong. Please try again.";

    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data as T;
}
