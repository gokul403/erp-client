const DEFAULT_API_URL = "http://localhost:5000/api";

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("erp-token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private handleUnauthorized() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("erp-token");
      localStorage.removeItem("erp-auth");
      localStorage.removeItem("erp-role");
      // If we are not on the login page already, redirect to it
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  async get<T>(path: string): Promise<T> {
    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (res.status === 401) {
      if (path !== "/auth/login") this.handleUnauthorized();
      const err = await res.json().catch(() => ({ error: "Unauthorized" }));
      throw new Error(err.error || "Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    return res.json() as Promise<T>;
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      if (path !== "/auth/login") this.handleUnauthorized();
      const err = await res.json().catch(() => ({ error: "Unauthorized" }));
      throw new Error(err.error || "Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    return res.json() as Promise<T>;
  }

  async put<T>(path: string, body?: any): Promise<T> {
    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      if (path !== "/auth/login") this.handleUnauthorized();
      const err = await res.json().catch(() => ({ error: "Unauthorized" }));
      throw new Error(err.error || "Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    return res.json() as Promise<T>;
  }

  async delete<T>(path: string): Promise<T> {
    const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (res.status === 401) {
      if (path !== "/auth/login") this.handleUnauthorized();
      const err = await res.json().catch(() => ({ error: "Unauthorized" }));
      throw new Error(err.error || "Unauthorized");
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

    return res.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
