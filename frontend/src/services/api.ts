
const baseURL = import.meta.env.VITE_API_URL;

async function request(path: string, options: RequestInit = {}) {
  const url = path.startsWith("/") ? `${baseURL}${path}` : `${baseURL}/${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(response.statusText || "Request failed");
    (error as any).response = response;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}

const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: "GET" }),
  post: (path: string, body: unknown, options?: RequestInit) =>
    request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown, options?: RequestInit) =>
    request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: "DELETE" }),
};

export default api;
