import type { ErrorResponse } from "@app/shared-types";

export interface RequestOptions extends RequestInit {
  includeAuth?: boolean;
}

/**
 * Centralized API client for making HTTP requests with consistent error handling
 * and automatic authentication token injection.
 */
export class ApiClient {
  constructor() {
    // API client setup - base URL not needed with Vite proxy
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: unknown, response?: Response): ErrorResponse {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (response) {
      return {
        success: false,
        message: `Request Failed: ${response.status} ${response.statusText}`,
      };
    }

    return {
      success: false,
      message: "Unknown error occurred",
    };
  }

  /**
   * Make HTTP request with automatic authentication and error handling
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { includeAuth = false, ...fetchOptions } = options;

    // Prepare headers
    const headers = new Headers(fetchOptions.headers);
    headers.set("Content-Type", "application/json");

    // Add authentication header if requested
    if (includeAuth) {
      const token = this.getAuthToken();
      if (!token) {
        return {
          success: false,
          message: "Authentication required",
        } as T;
      }
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers,
      });

      // Check for HTTP errors
      if (!response.ok) {
        try {
          const errorResponse = await response.json();
          return errorResponse as T;
        } catch {
          return this.handleError(null, response) as T;
        }
      }

      // Handle empty/204 responses (e.g., logout, delete operations)
      if (response.status === 204) {
        return undefined as T;
      }

      // Parse successful response (handle empty bodies gracefully)
      const text = await response.text();
      if (!text) {
        return undefined as T;
      }
      return JSON.parse(text) as T;
    } catch (error) {
      return this.handleError(error) as T;
    }
  }

  /**
   * Convenience method for GET requests
   */
  async get<T>(endpoint: string, includeAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      includeAuth,
    });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth = false,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      includeAuth,
    });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T>(endpoint: string, includeAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      includeAuth,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
