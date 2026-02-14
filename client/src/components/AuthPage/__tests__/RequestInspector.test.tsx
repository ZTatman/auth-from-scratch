import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RequestInspector } from "../RequestInspector";

describe("RequestInspector", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders request and sanitized response details", () => {
    render(
      <RequestInspector
        request={{
          method: "POST",
          url: "/api/login",
          headers: { "Content-Type": "application/json" },
          body: { username: "alice", password: "***" },
        }}
        response={{
          status: 200,
          statusText: "OK",
          body: {
            success: true,
            data: {
              user: { id: "user-1" },
              token: "abcdefghijklmnopqrstuvwxyz1234567890",
            },
          },
        }}
      />,
    );

    expect(screen.queryByText("POST")).not.toBeNull();
    expect(screen.queryByText("/api/login")).not.toBeNull();
    expect(screen.queryByText("Response Body:")).not.toBeNull();
    expect(screen.queryByText(/\[truncated\]/)).not.toBeNull();
    expect(screen.queryByText(/What's happening:/)).not.toBeNull();
  });
});
