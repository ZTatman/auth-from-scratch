import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FlowDefinition } from "./flow-script";

export type PlaybackSpeed = 0.5 | 1 | 1.5;

export interface PlaybackDebugEvent {
  type:
    | "PLAY"
    | "PAUSE"
    | "RESET"
    | "SEEK"
    | "SEEK_STEP"
    | "STEP_NEXT"
    | "STEP_PREVIOUS"
    | "STEP_CHANGE"
    | "AUTO_ADVANCE_TOGGLE"
    | "SPEED_CHANGE";
  flowId: string;
  stepId: string | null;
  stepIndex: number;
  timestamp: number;
  metadata?: Record<string, number | string | boolean>;
}

export interface UseFlowPlaybackOptions {
  autoplay?: boolean;
  autoAdvance?: boolean;
  speed?: PlaybackSpeed;
  onDebugEvent?: (event: PlaybackDebugEvent) => void;
}

export interface PlaybackState {
  activeEventIndex: number;
  eventProgress: number;
  globalProgress: number;
  isPlaying: boolean;
  autoAdvance: boolean;
  speed: PlaybackSpeed;
}

export interface PlaybackActions {
  play: () => void;
  pause: () => void;
  reset: () => void;
  seek: (normalizedProgress: number) => void;
  seekEvent: (eventIndex: number) => void;
  previousEvent: () => void;
  nextEvent: () => void;
  setAutoAdvance: (nextAutoAdvance: boolean) => void;
  setSpeed: (nextSpeed: PlaybackSpeed) => void;
}

export type FlowPlaybackState = PlaybackState & PlaybackActions;

const DEFAULT_SPEED: PlaybackSpeed = 1;

/**
 * Drive deterministic playback for auth flow steps.
 *
 * @param flow - Flow definition with timed steps
 * @param options - Playback options including autoplay and speed
 * @returns Current playback state and playback controls
 */
export function useFlowPlayback(
  flow: FlowDefinition,
  options: UseFlowPlaybackOptions = {},
): FlowPlaybackState {
  const {
    autoplay = false,
    autoAdvance: initialAutoAdvance = true,
    speed: initialSpeed = DEFAULT_SPEED,
    onDebugEvent,
  } = options;

  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [eventProgress, setEventProgress] = useState(0);
  const [elapsedInEventMs, setElapsedInEventMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [autoAdvance, setAutoAdvanceState] = useState(initialAutoAdvance);
  const [speed, setSpeedState] = useState<PlaybackSpeed>(initialSpeed);

  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const speedRef = useRef<PlaybackSpeed>(initialSpeed);
  const autoAdvanceRef = useRef(initialAutoAdvance);
  const activeEventIndexRef = useRef(0);
  const elapsedInEventRef = useRef(0);

  const steps = flow.steps;
  const eventTotals = useMemo(
    () => steps.map((step) => step.durationMs + step.pauseAfterMs),
    [steps],
  );
  const totalTimelineMs = useMemo(
    () => eventTotals.reduce((sum, total) => sum + total, 0),
    [eventTotals],
  );

  const emitDebugEvent = useCallback(
    (
      type: PlaybackDebugEvent["type"],
      stepIndex: number,
      metadata?: PlaybackDebugEvent["metadata"],
    ): void => {
      if (!onDebugEvent) return;
      const step = steps[stepIndex];

      onDebugEvent({
        type,
        flowId: flow.id,
        stepId: step?.id ?? null,
        stepIndex,
        timestamp: Date.now(),
        metadata,
      });
    },
    [flow.id, onDebugEvent, steps],
  );

  const applyPlaybackFrame = useCallback(
    (nextEventIndex: number, nextElapsedInEventMs: number): void => {
      const clampedEventIndex = Math.min(
        Math.max(nextEventIndex, 0),
        Math.max(steps.length - 1, 0),
      );
      const step = steps[clampedEventIndex];

      const clampedElapsed = Math.max(nextElapsedInEventMs, 0);
      const progress = step ? Math.min(clampedElapsed / step.durationMs, 1) : 0;

      activeEventIndexRef.current = clampedEventIndex;
      elapsedInEventRef.current = clampedElapsed;

      setActiveEventIndex(clampedEventIndex);
      setElapsedInEventMs(clampedElapsed);
      setEventProgress(progress);
    },
    [steps],
  );

  const pause = useCallback((): void => {
    setIsPlaying(false);
    emitDebugEvent("PAUSE", activeEventIndexRef.current);
  }, [emitDebugEvent]);

  const play = useCallback((): void => {
    if (steps.length === 0) return;
    setIsPlaying(true);
    emitDebugEvent("PLAY", activeEventIndexRef.current);
  }, [emitDebugEvent, steps.length]);

  const reset = useCallback((): void => {
    setIsPlaying(false);
    lastTimestampRef.current = null;
    applyPlaybackFrame(0, 0);
    emitDebugEvent("RESET", 0);
  }, [applyPlaybackFrame, emitDebugEvent]);

  const seek = useCallback(
    (normalizedProgress: number): void => {
      if (steps.length === 0 || totalTimelineMs <= 0) return;

      const clamped = Math.min(Math.max(normalizedProgress, 0), 1);
      const targetMs = clamped * totalTimelineMs;

      let remainingMs = targetMs;
      let targetEventIndex = 0;

      while (
        targetEventIndex < eventTotals.length - 1 &&
        remainingMs >= eventTotals[targetEventIndex]
      ) {
        remainingMs -= eventTotals[targetEventIndex];
        targetEventIndex += 1;
      }

      applyPlaybackFrame(targetEventIndex, remainingMs);
      emitDebugEvent("SEEK", targetEventIndex, {
        normalizedProgress: clamped,
      });
    },
    [applyPlaybackFrame, emitDebugEvent, eventTotals, steps.length, totalTimelineMs],
  );

  const seekEvent = useCallback(
    (eventIndex: number): void => {
      const clampedIndex = Math.min(
        Math.max(eventIndex, 0),
        Math.max(steps.length - 1, 0),
      );
      applyPlaybackFrame(clampedIndex, 0);
      emitDebugEvent("SEEK_STEP", clampedIndex);
    },
    [applyPlaybackFrame, emitDebugEvent, steps.length],
  );

  const previousEvent = useCallback((): void => {
    if (steps.length === 0) return;

    const previousIndex =
      activeEventIndexRef.current <= 0
        ? steps.length - 1
        : activeEventIndexRef.current - 1;
    applyPlaybackFrame(previousIndex, 0);
    emitDebugEvent("STEP_PREVIOUS", previousIndex);
  }, [applyPlaybackFrame, emitDebugEvent, steps.length]);

  const nextEvent = useCallback((): void => {
    if (steps.length === 0) return;

    const nextIndex = (activeEventIndexRef.current + 1) % steps.length;
    applyPlaybackFrame(nextIndex, 0);
    emitDebugEvent("STEP_NEXT", nextIndex);
  }, [applyPlaybackFrame, emitDebugEvent, steps.length]);

  const setAutoAdvance = useCallback(
    (nextAutoAdvance: boolean): void => {
      autoAdvanceRef.current = nextAutoAdvance;
      setAutoAdvanceState(nextAutoAdvance);
      emitDebugEvent("AUTO_ADVANCE_TOGGLE", activeEventIndexRef.current, {
        autoAdvance: nextAutoAdvance,
      });
    },
    [emitDebugEvent],
  );

  const setSpeed = useCallback(
    (nextSpeed: PlaybackSpeed): void => {
      speedRef.current = nextSpeed;
      setSpeedState(nextSpeed);
      emitDebugEvent("SPEED_CHANGE", activeEventIndexRef.current, {
        speed: nextSpeed,
      });
    },
    [emitDebugEvent],
  );

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  useEffect(() => {
    setIsPlaying(autoplay);
    lastTimestampRef.current = null;
    applyPlaybackFrame(0, 0);
    emitDebugEvent("STEP_CHANGE", 0, { reason: "flow_changed" });
  }, [applyPlaybackFrame, autoplay, emitDebugEvent, flow.id]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0 || totalTimelineMs <= 0) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
      return;
    }

    const tick = (timestamp: number): void => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const frameDelta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      let nextEventIndex = activeEventIndexRef.current;
      let nextElapsedInEventMs =
        elapsedInEventRef.current + frameDelta * speedRef.current;
      let stepChanged = false;
      let shouldPauseAtEventEnd = false;

      let guard = 0;
      while (guard < steps.length + 2) {
        guard += 1;

        const eventTotalMs =
          steps[nextEventIndex].durationMs + steps[nextEventIndex].pauseAfterMs;

        if (nextElapsedInEventMs < eventTotalMs) {
          break;
        }

        if (!autoAdvanceRef.current) {
          nextElapsedInEventMs = steps[nextEventIndex].durationMs;
          shouldPauseAtEventEnd = true;
          break;
        }

        nextElapsedInEventMs -= eventTotalMs;
        nextEventIndex = nextEventIndex >= steps.length - 1 ? 0 : nextEventIndex + 1;
        stepChanged = true;
      }

      applyPlaybackFrame(nextEventIndex, nextElapsedInEventMs);

      if (stepChanged) {
        emitDebugEvent("STEP_CHANGE", nextEventIndex, { reason: "playback_tick" });
      }

      if (shouldPauseAtEventEnd) {
        setIsPlaying(false);
        lastTimestampRef.current = null;
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [applyPlaybackFrame, emitDebugEvent, isPlaying, steps, totalTimelineMs]);

  const globalProgress = useMemo(() => {
    if (totalTimelineMs <= 0 || steps.length === 0) return 0;

    const completedMs = eventTotals
      .slice(0, activeEventIndex)
      .reduce((sum, eventTotal) => sum + eventTotal, 0);

    return Math.min((completedMs + elapsedInEventMs) / totalTimelineMs, 1);
  }, [activeEventIndex, elapsedInEventMs, eventTotals, steps.length, totalTimelineMs]);

  return {
    activeEventIndex,
    eventProgress,
    globalProgress,
    isPlaying,
    autoAdvance,
    speed,
    play,
    pause,
    reset,
    seek,
    seekEvent,
    previousEvent,
    nextEvent,
    setAutoAdvance,
    setSpeed,
  };
}
