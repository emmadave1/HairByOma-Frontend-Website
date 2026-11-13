const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

type ApiError = Error & {
  status: number;
  data: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  const { body, auth: _auth = true, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
    {
      ...requestOptions,
      credentials: "include",
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