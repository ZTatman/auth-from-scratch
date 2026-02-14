import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteAccount, useGetProfile, useLogin, useRegister } from "../index";

const {
  useMutationMock,
  useQueryMock,
  loginApiMock,
  registerApiMock,
  getProfileMock,
  deleteAccountMock,
  userLoginMock,
} = vi.hoisted(() => ({
  // Return options directly so hook tests can assert mutation/query configuration.
  useMutationMock: vi.fn((options) => options),
  useQueryMock: vi.fn((options) => options),
  loginApiMock: vi.fn(),
  registerApiMock: vi.fn(),
  getProfileMock: vi.fn(),
  deleteAccountMock: vi.fn(),
  userLoginMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
}));

vi.mock("../../../api/auth", () => ({
  login: loginApiMock,
  register: registerApiMock,
}));

vi.mock("../../../api/profile", () => ({
  getProfile: getProfileMock,
  deleteAccount: deleteAccountMock,
}));

vi.mock("../../useUser", () => ({
  default: () => ({ login: userLoginMock }),
}));

describe("api hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures useLogin mutation and logs user in on success", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useLogin());
    const mutation = result.current as unknown as {
      mutationFn: unknown;
      onSuccess: (response: {
        success: boolean;
        data?: {
          user: { id: string; username: string; createdAt: string };
          token?: string;
        };
      }) => void;
      onError: (error: unknown) => void;
    };

    expect(mutation.mutationFn).toBe(loginApiMock);

    mutation.onSuccess({
      success: true,
      data: {
        user: {
          id: "user-1",
          username: "alice",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        token: "token",
      },
    });

    expect(userLoginMock).toHaveBeenCalledWith(
      {
        id: "user-1",
        username: "alice",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
      "token",
    );

    mutation.onError(new Error("login failed"));
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("configures useRegister mutation callbacks", () => {
    const consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useRegister());
    const mutation = result.current as unknown as {
      mutationFn: unknown;
      onSuccess: (data: unknown) => void;
      onError: (error: unknown) => void;
    };

    expect(mutation.mutationFn).toBe(registerApiMock);

    mutation.onSuccess({ success: true, message: "ok" });
    mutation.onError(new Error("register failed"));

    expect(consoleLogSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("configures useGetProfile query options", () => {
    const { result: withToken } = renderHook(() => useGetProfile("token"));
    const queryWithToken = withToken.current as unknown as {
      queryKey: unknown[];
      queryFn: () => unknown;
      enabled: boolean;
      staleTime: number;
      retry: number;
    };

    expect(queryWithToken.queryKey).toEqual(["profile", "token"]);
    expect(queryWithToken.enabled).toBe(true);
    expect(queryWithToken.staleTime).toBe(5 * 60 * 1000);
    expect(queryWithToken.retry).toBe(1);
    expect(queryWithToken.queryFn).toBeTypeOf("function");

    const { result: withoutToken } = renderHook(() => useGetProfile(undefined));
    const queryWithoutToken = withoutToken.current as unknown as {
      enabled: boolean;
    };
    expect(queryWithoutToken.enabled).toBe(false);
  });

  it("configures useDeleteAccount mutation", async () => {
    deleteAccountMock.mockResolvedValue({
      success: true,
      message: "deleted",
      data: { userId: "user-1" },
    });

    const { result } = renderHook(() => useDeleteAccount());
    const mutation = result.current as unknown as {
      mutationFn: () => Promise<{ userId: string }>;
    };

    expect(mutation.mutationFn).toBeTypeOf("function");
    await expect(mutation.mutationFn()).resolves.toEqual({ userId: "user-1" });
    expect(deleteAccountMock).toHaveBeenCalledTimes(1);
  });
});
