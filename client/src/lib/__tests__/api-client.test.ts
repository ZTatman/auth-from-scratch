import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installLocalStorageMock } from "../../test-utils/mocks";
import { ApiClient } from "../api-client";

interface MockResponseInit {
  ok: boolean;
  status?: number;
  statusText?: string;
  jsonValue?: unknown;
  textValue?: string;
  jsonThrows?: boolean;
}

function createMockResponse(init: MockResponseInit): Response {
  return {
    ok: init.ok,
    status: init.status ?? 200,
    statusText: init.statusText ?? "OK",
    json: vi.fn(async () => {
      if (init.jsonThrows) {
        throw new Error("invalid json");
      }
      return init.jsonValue;
    }),
    text: vi.fn(async () => init.textValue ?? ""),
  } as unknown as Response;
}

describe("ApiClient", () => {
  const fetchMock = vi.fn();
  let restoreLocalStorage: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    restoreLocalStorage = installLocalStorageMock();
    localStorage.clear();
  });

  afterEach(() => {
    restoreLocalStorage?.();
  });

  it("returns authentication required when includeAuth is true and token is missing", async () => {
    const client = new ApiClient();

    const result = await client.request<{ success: boolean; message: string }>(
      "/api/profile",
      { includeAuth: true },
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: "Authentication required",
      status: 401,
    });
  });

  it("injects bearer token when includeAuth is true", async () => {
    localStorage.setItem("auth_token", "jwt-token");
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        textValue: JSON.stringify({ success: true }),
      }),
    );

    const client = new ApiClient();
    await client.get<{ success: boolean }>("/api/profile", true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;

    expect(options.method).toBe("GET");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer jwt-token");
  });

  it("returns parsed error JSON for non-ok responses", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        jsonValue: { success: false, message: "Validation failed" },
      }),
    );

    const client = new ApiClient();
    const result = await client.post<{ success: boolean; message: string }>(
      "/api/register",
      { username: "bad" },
    );

    expect(result).toEqual({
      success: false,
      message: "Validation failed",
      status: 400,
    });
  });

  it("falls back to status error when non-ok response JSON parsing fails", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        jsonThrows: true,
      }),
    );

    const client = new ApiClient();
    const result = await client.request<{ success: boolean; message: string }>(
      "/api/test",
    );

    expect(result).toEqual({
      success: false,
      message: "Request Failed: 500 Internal Server Error",
      status: 500,
    });
  });

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        status: 204,
        statusText: "No Content",
      }),
    );

    const client = new ApiClient();
    const result = await client.delete<undefined>("/api/profile", false);

    expect(result).toBeUndefined();
  });

  it("returns undefined for empty successful response body", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        status: 200,
        textValue: "",
      }),
    );

    const client = new ApiClient();
    const result = await client.request<undefined>("/api/empty");

    expect(result).toBeUndefined();
  });

  it("returns parsed JSON for successful responses", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse({
        ok: true,
        status: 200,
        textValue: JSON.stringify({ success: true, data: { id: "user-1" } }),
      }),
    );

    const client = new ApiClient();
    const result = await client.request<{ success: boolean; data: { id: string } }>(
      "/api/profile",
    );

    expect(result).toEqual({ success: true, data: { id: "user-1" } });
  });

  it("returns handled error when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));

    const client = new ApiClient();
    const result = await client.request<{ success: boolean; message: string }>(
      "/api/profile",
    );

    expect(result).toEqual({
      success: false,
      message: "Network error",
    });
  });
});
