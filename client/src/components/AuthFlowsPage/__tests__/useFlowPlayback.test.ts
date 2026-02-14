import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FLOW_REGISTRY, JWT_FLOW_SCRIPT } from "../flow-script";
import { useFlowPlayback } from "../useFlowPlayback";

describe("useFlowPlayback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(Date.now()), 16),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) =>
      window.clearTimeout(id),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("advances to the next event during playback", async () => {
    const { result } = renderHook(() =>
      useFlowPlayback(JWT_FLOW_SCRIPT, {
        speed: 1,
      }),
    );

    act(() => {
      result.current.play();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1700);
    });

    expect(result.current.activeEventIndex).toBe(1);
    expect(result.current.eventProgress).toBeGreaterThan(0);
  });

  it("stops at the end of the current event when auto-advance is disabled", async () => {
    const { result } = renderHook(() =>
      useFlowPlayback(JWT_FLOW_SCRIPT, {
        autoAdvance: false,
        speed: 1,
      }),
    );

    act(() => {
      result.current.play();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1700);
    });

    expect(result.current.activeEventIndex).toBe(0);
    expect(result.current.eventProgress).toBe(1);
    expect(result.current.isPlaying).toBe(false);
  });

  it("pauses and resumes without losing timeline position", async () => {
    const { result } = renderHook(() =>
      useFlowPlayback(JWT_FLOW_SCRIPT, {
        speed: 1,
      }),
    );

    act(() => {
      result.current.play();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });
    act(() => {
      result.current.pause();
    });

    const pausedIndex = result.current.activeEventIndex;
    const pausedProgress = result.current.eventProgress;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.activeEventIndex).toBe(pausedIndex);
    expect(result.current.eventProgress).toBe(pausedProgress);

    act(() => {
      result.current.play();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });

    expect(result.current.activeEventIndex > pausedIndex || result.current.eventProgress > pausedProgress).toBe(true);
  });

  it("seeks to boundaries and clamps progress", () => {
    const { result } = renderHook(() =>
      useFlowPlayback(JWT_FLOW_SCRIPT, {
        speed: 1,
      }),
    );

    act(() => {
      result.current.seek(1);
    });

    expect(result.current.activeEventIndex).toBe(JWT_FLOW_SCRIPT.steps.length - 1);
    expect(result.current.eventProgress).toBe(1);

    act(() => {
      result.current.seek(0);
    });

    expect(result.current.activeEventIndex).toBe(0);
    expect(result.current.eventProgress).toBe(0);
  });

  it("applies speed multiplier correctly", async () => {
    const { result } = renderHook(() =>
      useFlowPlayback(JWT_FLOW_SCRIPT, {
        speed: 1,
      }),
    );

    act(() => {
      result.current.setSpeed(0.5);
      result.current.play();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    act(() => {
      result.current.pause();
    });

    const slowIndex = result.current.activeEventIndex;
    const slowProgress = result.current.eventProgress;

    act(() => {
      result.current.reset();
      result.current.setSpeed(1.5);
      result.current.play();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    act(() => {
      result.current.pause();
    });

    expect(
      result.current.activeEventIndex > slowIndex ||
        result.current.eventProgress > slowProgress,
    ).toBe(true);
  });

  it("emits debug events for playback actions", () => {
    const debugSpy = vi.fn();
    const { result } = renderHook(() =>
      useFlowPlayback(JWT_FLOW_SCRIPT, {
        speed: 1,
        onDebugEvent: debugSpy,
      }),
    );

    act(() => {
      result.current.setAutoAdvance(false);
      result.current.play();
      result.current.pause();
      result.current.seekEvent(2);
    });

    expect(debugSpy).toHaveBeenCalled();
    expect(
      debugSpy.mock.calls.some(([event]) => event.type === "AUTO_ADVANCE_TOGGLE"),
    ).toBe(true);
    expect(debugSpy.mock.calls.some(([event]) => event.type === "PLAY")).toBe(true);
    expect(debugSpy.mock.calls.some(([event]) => event.type === "PAUSE")).toBe(true);
    expect(debugSpy.mock.calls.some(([event]) => event.type === "SEEK_STEP")).toBe(
      true,
    );
  });

  it("resets playback when flow ID changes", async () => {
    const { result, rerender } = renderHook(
      ({ flowId }: { flowId: string }) =>
        useFlowPlayback(FLOW_REGISTRY[flowId], {
          speed: 1,
        }),
      { initialProps: { flowId: "jwt-password" } },
    );

    act(() => {
      result.current.seekEvent(3);
    });

    expect(result.current.activeEventIndex).toBe(3);

    rerender({ flowId: "oauth-auth-code" });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });

    expect(result.current.activeEventIndex).toBe(0);
    expect(result.current.eventProgress).toBe(0);
  });
});
