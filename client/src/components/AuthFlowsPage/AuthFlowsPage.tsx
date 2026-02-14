import {
  type CSSProperties,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Background,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type EdgeTypes,
  type Node,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  AnimatedNodeEdge,
  type AnimatedNodeEdge as AnimatedNodeEdgeType,
} from "./AnimatedNodeEdge";
import {
  DEFAULT_FLOW_ID,
  getFlowDefinitionById,
  getFlowDefinitionList,
  type FlowProtocol,
  type FlowVariant,
} from "./flow-script";
import {
  useFlowPlayback,
  type PlaybackDebugEvent,
  type PlaybackSpeed,
} from "./useFlowPlayback";
import { NavigationBar } from "../NavigationBar/NavigationBar";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

import "@xyflow/react/dist/style.css";

interface AuthFlowNodeData extends Record<string, unknown> {
  label: string;
  detail?: string;
  variant?: FlowVariant;
  isActive?: boolean;
  isMuted?: boolean;
  lifelineHeight: number;
}

type SequenceParticipantFlowNode = Node<AuthFlowNodeData, "sequenceParticipant">;

const PARTICIPANT_NODE_WIDTH = 192;
const PARTICIPANT_START_X = 80;
const PARTICIPANT_SPACING_X = 260;
const PARTICIPANT_TOP_Y = 24;
const PARTICIPANT_CARD_HEIGHT = 76;
const EVENT_ROW_START_Y = 154;
const EVENT_ROW_GAP = 54;
const PLAYBACK_SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 1, 1.5];
const AUTOPLAY_ON_LOAD = false;
const AUTO_ADVANCE_BY_DEFAULT = false;
const MAX_DEBUG_EVENTS = 10;
const VIEWPORT_MIN_ZOOM = 0.55;
const VIEWPORT_MAX_ZOOM = 1.8;
const FIT_VIEW_PADDING = 0.18;
const FLOW_OPTIONS = getFlowDefinitionList();
const INITIAL_FLOW_ID = FLOW_OPTIONS[0]?.id ?? DEFAULT_FLOW_ID;
const TIMELINE_CONTROL_BASE_CLASS =
  "shrink-0 rounded-md border border-border bg-card text-[11px] font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground";
const TIMELINE_ICON_CONTROL_CLASS = cn(
  TIMELINE_CONTROL_BASE_CLASS,
  "inline-flex h-8 w-8 items-center justify-center p-0",
);
const TIMELINE_TEXT_CONTROL_CLASS = cn(TIMELINE_CONTROL_BASE_CLASS, "h-8 px-2");
const TIMELINE_SELECT_CONTROL_CLASS = cn(TIMELINE_CONTROL_BASE_CLASS, "h-8 px-2");
const TIMELINE_AUTOPLAY_CONTROL_CLASS = cn(
  TIMELINE_CONTROL_BASE_CLASS,
  "inline-flex h-8 items-center gap-1.5 px-2",
);

/**
 * Filled transport icon set with Tailwind gray theming.
 */
function BackFillIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M6 4.5h1.5v11H6z" />
      <path d="M8.7 10 15 5.2v9.6L8.7 10z" />
    </svg>
  );
}

function PlayFillIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M6.5 4.8a1 1 0 0 1 1.53-.85l8 5.2a1 1 0 0 1 0 1.7l-8 5.2a1 1 0 0 1-1.53-.84V4.8z" />
    </svg>
  );
}

function PauseFillIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M5.5 4.5A1.5 1.5 0 0 1 7 3h1a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 8 17h-1a1.5 1.5 0 0 1-1.5-1.5v-11zM10.5 4.5A1.5 1.5 0 0 1 12 3h1a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 13 17h-1a1.5 1.5 0 0 1-1.5-1.5v-11z" />
    </svg>
  );
}

function NextFillIcon(): ReactElement {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M12.5 4.5H14v11h-1.5z" />
      <path d="M11.3 10 5 14.8V5.2L11.3 10z" />
    </svg>
  );
}

const PROTOCOL_LABELS: Record<FlowProtocol, string> = {
  jwt: "JWT",
  oauth: "OAuth",
  "api-key": "API Key",
};

const PROTOCOL_BADGE_CLASSES: Record<FlowProtocol, string> = {
  jwt: "border-sky-200 bg-sky-50 text-sky-700",
  oauth: "border-violet-200 bg-violet-50 text-violet-700",
  "api-key": "border-orange-200 bg-orange-50 text-orange-700",
};

const PARTICIPANT_VARIANT_STYLES: Record<
  FlowVariant,
  {
    idle: string;
    active: string;
  }
> = {
  client: {
    idle: "border-sky-200 bg-sky-50 text-sky-800",
    active: "border-sky-500 bg-sky-500 text-white",
  },
  server: {
    idle: "border-emerald-200 bg-emerald-50 text-emerald-800",
    active: "border-emerald-500 bg-emerald-500 text-white",
  },
  database: {
    idle: "border-amber-200 bg-amber-50 text-amber-900",
    active: "border-amber-400 bg-amber-400 text-slate-900",
  },
  storage: {
    idle: "border-cyan-200 bg-cyan-50 text-cyan-800",
    active: "border-cyan-500 bg-cyan-500 text-white",
  },
  idp: {
    idle: "border-violet-200 bg-violet-50 text-violet-800",
    active: "border-violet-500 bg-violet-500 text-white",
  },
  resource: {
    idle: "border-indigo-200 bg-indigo-50 text-indigo-800",
    active: "border-indigo-500 bg-indigo-500 text-white",
  },
};

const STEP_VARIANT_LABELS: Record<FlowVariant, string> = {
  client: "Client",
  server: "Server",
  database: "Database",
  storage: "Storage",
  idp: "Identity Provider",
  resource: "Resource Server",
};

const STEP_VARIANT_CLASSES: Record<
  FlowVariant,
  {
    badgeActive: string;
    badgeActiveText: string;
    dot: string;
    range: string;
    edgeHex: string;
  }
> = {
  client: {
    badgeActive: "bg-sky-500 border-sky-500",
    badgeActiveText: "text-white",
    dot: "bg-sky-400",
    range: "accent-sky-500",
    edgeHex: "#0ea5e9",
  },
  server: {
    badgeActive: "bg-emerald-500 border-emerald-500",
    badgeActiveText: "text-white",
    dot: "bg-emerald-400",
    range: "accent-emerald-500",
    edgeHex: "#10b981",
  },
  database: {
    badgeActive: "bg-amber-400 border-amber-400",
    badgeActiveText: "text-slate-900",
    dot: "bg-amber-400",
    range: "accent-amber-500",
    edgeHex: "#fbbf24",
  },
  storage: {
    badgeActive: "bg-cyan-500 border-cyan-500",
    badgeActiveText: "text-white",
    dot: "bg-cyan-400",
    range: "accent-cyan-500",
    edgeHex: "#06b6d4",
  },
  idp: {
    badgeActive: "bg-violet-500 border-violet-500",
    badgeActiveText: "text-white",
    dot: "bg-violet-400",
    range: "accent-violet-500",
    edgeHex: "#8b5cf6",
  },
  resource: {
    badgeActive: "bg-indigo-500 border-indigo-500",
    badgeActiveText: "text-white",
    dot: "bg-indigo-400",
    range: "accent-indigo-500",
    edgeHex: "#6366f1",
  },
};

const EDGE_STYLE: CSSProperties = {
  strokeWidth: 2,
  stroke: "#94a3b8",
  strokeDasharray: "4 4",
};

/**
 * Resolve the y-coordinate used for each message row in the sequence canvas.
 *
 * @param stepIndex - Index in the selected flow steps array
 * @returns Sequence row y coordinate in React Flow space
 */
function getEventRowY(stepIndex: number): number {
  return PARTICIPANT_TOP_Y + EVENT_ROW_START_Y + stepIndex * EVENT_ROW_GAP;
}

/**
 * Render a sequence participant node with a vertical lifeline.
 *
 * @param data - Participant node display data
 * @returns JSX for one sequence participant and lifeline
 */
function SequenceParticipantNode({
  data,
}: NodeProps<SequenceParticipantFlowNode>): ReactElement {
  const variant = data.variant ?? "client";
  const variantStyles = PARTICIPANT_VARIANT_STYLES[variant];
  const isActive = data.isActive ?? false;
  const isMuted = data.isMuted ?? false;
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative flex w-[192px] flex-col items-center"
      initial={false}
      animate={{
        opacity: isMuted ? 0.65 : 1,
      }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
    >
      <motion.div
        className={cn(
          "w-full rounded-xl border px-3 py-3 text-center shadow-sm",
          isActive ? variantStyles.active : variantStyles.idle,
        )}
        initial={false}
        animate={{ scale: isActive && !prefersReducedMotion ? 1.04 : 1 }}
        transition={{
          type: prefersReducedMotion ? "tween" : "spring",
          stiffness: 280,
          damping: 24,
          duration: prefersReducedMotion ? 0 : undefined,
        }}
      >
        <p className="text-sm font-semibold leading-tight">{data.label}</p>
        {data.detail ? (
          <p className="mt-1 text-xs opacity-90">{data.detail}</p>
        ) : null}
      </motion.div>

      <div
        className="mt-3 w-px border-l border-dashed border-slate-300/90"
        style={{ height: data.lifelineHeight }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="timeline-source"
        className="opacity-0"
        style={{ left: "50%" }}
        isConnectable={false}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="timeline-target"
        className="opacity-0"
        style={{ left: "50%" }}
        isConnectable={false}
      />
    </motion.div>
  );
}

const NODE_TYPES: NodeTypes = {
  sequenceParticipant: SequenceParticipantNode,
};

const EDGE_TYPES: EdgeTypes = {
  animatedNode: AnimatedNodeEdge,
};

/**
 * Auth flows page showing a sequence-diagram style visualizer.
 *
 * @returns Auth flows page
 */
export function AuthFlowsPage(): ReactElement {
  const [selectedFlowId, setSelectedFlowId] = useState(INITIAL_FLOW_ID);
  const selectedFlow = getFlowDefinitionById(selectedFlowId);

  const prefersReducedMotion = useReducedMotion();
  const [debugEvents, setDebugEvents] = useState<PlaybackDebugEvent[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<
    ReactFlowInstance<SequenceParticipantFlowNode, AnimatedNodeEdgeType> | null
  >(null);
  const handleDebugEvent = useCallback((event: PlaybackDebugEvent): void => {
    setDebugEvents((previousEvents) => [event, ...previousEvents].slice(0, MAX_DEBUG_EVENTS));
  }, []);

  const {
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
  } = useFlowPlayback(selectedFlow, {
    autoplay: AUTOPLAY_ON_LOAD,
    autoAdvance: AUTO_ADVANCE_BY_DEFAULT,
    speed: 1,
    onDebugEvent: handleDebugEvent,
  });

  const activeStep = selectedFlow.steps[activeEventIndex] ?? selectedFlow.steps[0]!;

  const activeVariant = activeStep.variant;

  const lifelineHeight = useMemo(() => {
    const lastRowY = getEventRowY(selectedFlow.steps.length - 1);
    return Math.max(
      lastRowY - (PARTICIPANT_TOP_Y + PARTICIPANT_CARD_HEIGHT) + 48,
      280,
    );
  }, [selectedFlow.steps.length]);

  const sequenceDiagramHeight = useMemo(() => {
    const lastRowY = getEventRowY(selectedFlow.steps.length - 1);
    return Math.max(lastRowY + 104, 500);
  }, [selectedFlow.steps.length]);

  const flowBounds = useMemo(() => {
    const left = PARTICIPANT_START_X - 56;
    const right =
      PARTICIPANT_START_X +
      (selectedFlow.participants.length - 1) * PARTICIPANT_SPACING_X +
      PARTICIPANT_NODE_WIDTH +
      56;
    const top = Math.max(0, PARTICIPANT_TOP_Y - 40);
    const bottom = getEventRowY(selectedFlow.steps.length - 1) + 42;

    return {
      x: left,
      y: top,
      width: Math.max(right - left, 320),
      height: Math.max(bottom - top, 320),
    };
  }, [selectedFlow.participants.length, selectedFlow.steps.length]);

  const flowNodes = useMemo(() => {
    const activeParticipantIds = new Set([activeStep.from, activeStep.to]);
    return selectedFlow.participants.map(
      (participant): SequenceParticipantFlowNode => {
        const isActive = activeParticipantIds.has(participant.id);

        return {
          id: participant.id,
          type: "sequenceParticipant",
          position: {
            x: PARTICIPANT_START_X + participant.laneIndex * PARTICIPANT_SPACING_X,
            y: PARTICIPANT_TOP_Y,
          },
          data: {
            label: participant.label,
            detail: participant.detail,
            variant: participant.variant,
            isActive,
            isMuted: !isActive,
            lifelineHeight,
          },
        };
      },
    );
  }, [
    activeStep.from,
    activeStep.to,
    lifelineHeight,
    selectedFlow.participants,
  ]);

  const flowEdges = useMemo(() => {
    return selectedFlow.steps.map((step, index): AnimatedNodeEdgeType => {
      const isActive = index === activeEventIndex;
      const stepVariant = STEP_VARIANT_CLASSES[step.variant];
      const edgeColor = stepVariant.edgeHex;

      return {
        id: step.id,
        type: "animatedNode",
        source: step.from,
        target: step.to,
        sourceHandle: "timeline-source",
        targetHandle: "timeline-target",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isActive ? edgeColor : "#94a3b8",
        },
        style: EDGE_STYLE,
        data: {
          progress: isActive ? eventProgress : 0,
          isActive,
          tokenType: step.tokenType,
          edgeColor,
          emphasis: isActive ? 1 : 0.45,
          rowY: getEventRowY(index),
          stepNumber: index + 1,
        },
      };
    });
  }, [activeEventIndex, eventProgress, selectedFlow.steps]);

  const handleFlowChange = useCallback(
    (nextFlowId: string): void => {
      pause();
      setSelectedFlowId(nextFlowId);
    },
    [pause],
  );

  const handleTimelineChange = useCallback(
    (nextValue: number): void => {
      pause();
      seek(nextValue / 100);
    },
    [pause, seek],
  );

  const handleSelectEvent = useCallback(
    (eventIndex: number): void => {
      pause();
      seekEvent(eventIndex);
    },
    [pause, seekEvent],
  );

  const handleNextEvent = useCallback((): void => {
    pause();
    nextEvent();
  }, [nextEvent, pause]);

  const handlePreviousEvent = useCallback((): void => {
    pause();
    previousEvent();
  }, [pause, previousEvent]);

  const handleAutoAdvanceChange = useCallback(
    (nextValue: boolean): void => {
      setAutoAdvance(nextValue);
    },
    [setAutoAdvance],
  );

  const fitCanvasToFlow = useCallback(
    (
      instance?: ReactFlowInstance<
        SequenceParticipantFlowNode,
        AnimatedNodeEdgeType
      >,
    ): void => {
      const activeInstance = instance ?? reactFlowInstance;
      if (!activeInstance) {
        return;
      }

      activeInstance.fitBounds(flowBounds, {
        padding: FIT_VIEW_PADDING,
        duration: prefersReducedMotion ? 0 : 180,
      });
    },
    [flowBounds, prefersReducedMotion, reactFlowInstance],
  );

  const handleInitFlow = useCallback(
    (
      instance: ReactFlowInstance<
        SequenceParticipantFlowNode,
        AnimatedNodeEdgeType
      >,
    ): void => {
      setReactFlowInstance(instance);
      requestAnimationFrame(() => {
        fitCanvasToFlow(instance);
      });
    },
    [fitCanvasToFlow],
  );

  useEffect(() => {
    fitCanvasToFlow();
  }, [fitCanvasToFlow, selectedFlow.id]);

  useEffect(() => {
    const handleResize = (): void => {
      fitCanvasToFlow();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [fitCanvasToFlow]);

  const togglePlayback = useCallback((): void => {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  }, [isPlaying, pause, play]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePlayback();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextEvent();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePreviousEvent();
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        handleSelectEvent(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        handleSelectEvent(selectedFlow.steps.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleNextEvent,
    handlePreviousEvent,
    handleSelectEvent,
    selectedFlow.steps.length,
    togglePlayback,
  ]);

  return (
    <div className="bg-background flex min-h-screen w-full flex-col">
      <NavigationBar />

      <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-5 sm:p-4 lg:gap-6 lg:p-6">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Active step {activeEventIndex + 1} of {selectedFlow.steps.length}:{" "}
          {activeStep.title}
        </div>

        <Tabs
          value={selectedFlow.id}
          onValueChange={handleFlowChange}
          className="flex flex-1 flex-col gap-4 sm:gap-6"
        >
          <header className="border-border/60 rounded-2xl border bg-slate-50/60 px-4 py-5 text-center sm:px-6 sm:py-6">
            <div className="mx-auto max-w-3xl space-y-2">
              <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
                Flow Visualizer
              </h1>
              <p className="text-muted-foreground">
                Explainable sequence playback for authentication lifecycles.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span
                  className={cn(
                    "inline-flex rounded-md border px-3 py-1 font-semibold",
                    PROTOCOL_BADGE_CLASSES[selectedFlow.protocol],
                  )}
                >
                  {PROTOCOL_LABELS[selectedFlow.protocol]}
                </span>
                <span>{selectedFlow.participants.length} participants</span>
                <span>•</span>
                <span>{selectedFlow.steps.length} steps</span>
                <span>•</span>
                <span>v{selectedFlow.version}</span>
              </div>
            </div>
            <TabsList className="mx-auto mt-4 w-fit bg-white/80 shadow-sm">
              {FLOW_OPTIONS.map((flowOption) => (
                <TabsTrigger key={flowOption.id} value={flowOption.id}>
                  {PROTOCOL_LABELS[flowOption.protocol]}
                </TabsTrigger>
              ))}
            </TabsList>
          </header>

          <div className="flex flex-1 flex-col pt-1 sm:pt-2">
            <div className="grid h-full grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex min-w-0 flex-col gap-4">
                <div className="bg-muted/20 relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
                  <div className="w-full">
                    <div
                      className="relative min-h-0 border-b border-slate-200"
                      style={{ height: `${sequenceDiagramHeight}px` }}
                    >
                      <ReactFlow<SequenceParticipantFlowNode, AnimatedNodeEdgeType>
                        key={selectedFlow.id}
                        className="!bg-transparent"
                        nodes={flowNodes}
                        edges={flowEdges}
                        nodeTypes={NODE_TYPES}
                        edgeTypes={EDGE_TYPES}
                        minZoom={VIEWPORT_MIN_ZOOM}
                        maxZoom={VIEWPORT_MAX_ZOOM}
                        onInit={handleInitFlow}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={false}
                        zoomOnScroll={false}
                        zoomOnDoubleClick={false}
                        panOnScroll={false}
                        panOnDrag={false}
                        zoomOnPinch={false}
                      >
                        <Background color="#dbeafe" gap={26} />
                      </ReactFlow>
                    </div>
                    <div className="bg-white/95 px-2 py-2.5 sm:px-3 sm:py-3">
                      <div className="mb-2 grid items-center gap-2 lg:grid-cols-[auto_minmax(0,1fr)]">
                        <div className="text-[11px] text-slate-500">
                          <span className="font-medium uppercase tracking-wide">
                            Timeline
                          </span>
                          <span className="ml-2">
                            Step {activeEventIndex + 1} / {selectedFlow.steps.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-1.5 lg:justify-end">
                          <select
                            aria-label="Playback speed"
                            value={speed}
                            className={TIMELINE_SELECT_CONTROL_CLASS}
                            onChange={(event) => {
                              const selectedSpeed = Number(
                                event.target.value,
                              ) as PlaybackSpeed;
                              setSpeed(selectedSpeed);
                            }}
                          >
                            {PLAYBACK_SPEED_OPTIONS.map((speedOption) => (
                              <option key={speedOption} value={speedOption}>
                                {speedOption}x
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            aria-label="Previous step"
                            className={TIMELINE_ICON_CONTROL_CLASS}
                            onClick={handlePreviousEvent}
                          >
                            <BackFillIcon />
                          </button>
                          <button
                            type="button"
                            aria-label={isPlaying ? "Pause animation" : "Play animation"}
                            className={cn(
                              TIMELINE_ICON_CONTROL_CLASS,
                              isPlaying ? "text-foreground" : "text-muted-foreground",
                            )}
                            onClick={togglePlayback}
                          >
                            {isPlaying ? <PauseFillIcon /> : <PlayFillIcon />}
                          </button>
                          <button
                            type="button"
                            aria-label="Next step"
                            className={TIMELINE_ICON_CONTROL_CLASS}
                            onClick={handleNextEvent}
                          >
                            <NextFillIcon />
                          </button>
                          <button
                            type="button"
                            className={TIMELINE_TEXT_CONTROL_CLASS}
                            onClick={reset}
                          >
                            Reset
                          </button>
                          <label className={TIMELINE_AUTOPLAY_CONTROL_CLASS}>
                            <span>Autoplay</span>
                            <input
                              aria-label="Canvas autoplay"
                              type="checkbox"
                              checked={autoAdvance}
                              onChange={(event) =>
                                handleAutoAdvanceChange(event.target.checked)
                              }
                              className="h-3.5 w-3.5 cursor-pointer accent-slate-500"
                            />
                          </label>
                        </div>
                      </div>
                      <div
                        className="mb-2 flex snap-x snap-mandatory items-stretch gap-1.5 overflow-x-auto pb-1"
                        data-testid="timeline-step-selectors"
                      >
                        {selectedFlow.steps.map((step, index) => {
                          const isActive = index === activeEventIndex;
                          const isCompleted = index < activeEventIndex;
                          const statusLabel = isActive
                            ? "Current"
                            : isCompleted
                              ? "Done"
                              : "Upcoming";

                          return (
                            <button
                              key={step.id}
                              type="button"
                              aria-current={isActive ? "step" : undefined}
                              aria-label={`Select step ${index + 1}: ${step.title}`}
                              className={cn(
                                "flex h-[68px] w-[min(15rem,72vw)] shrink-0 snap-start flex-col rounded-md border px-2.5 py-2 text-left transition sm:w-52 lg:w-56",
                                isActive
                                  ? cn(
                                      STEP_VARIANT_CLASSES[step.variant].badgeActive,
                                      STEP_VARIANT_CLASSES[step.variant].badgeActiveText,
                                    )
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900",
                              )}
                              onClick={() => handleSelectEvent(index)}
                            >
                              <span className="truncate text-[11px] font-semibold">
                                {index + 1}. {step.title}
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5 text-[10px]",
                                  isActive
                                    ? "text-white/85"
                                    : isCompleted
                                      ? "text-slate-500"
                                      : "text-slate-400",
                                )}
                              >
                                {statusLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        aria-label="Auth flow timeline"
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(globalProgress * 100)}
                        onChange={(event) =>
                          handleTimelineChange(Number(event.target.value))
                        }
                        className={cn(
                          "h-1.5 w-full cursor-pointer sm:h-1",
                          STEP_VARIANT_CLASSES[activeVariant].range,
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

                <aside className="w-full rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-700 shadow-sm sm:p-6 xl:overflow-y-auto">
                  <section className="space-y-3 border-b border-slate-200 pb-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Flow Metadata
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedFlow.title}
                    </h2>
                    <div
                      className={cn(
                        "inline-flex rounded-md border px-3 py-1 text-xs font-semibold",
                        PROTOCOL_BADGE_CLASSES[selectedFlow.protocol],
                      )}
                    >
                      {PROTOCOL_LABELS[selectedFlow.protocol]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Prerequisites
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">
                        {selectedFlow.prerequisites.map((prerequisite) => (
                          <li key={prerequisite}>{prerequisite}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        What This Proves
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-600">
                        {selectedFlow.whatThisProves.map((proof) => (
                          <li key={proof}>{proof}</li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  <section className="mt-4">
                    <div className="min-h-[30rem] overflow-hidden sm:min-h-[33rem]">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Active Step
                          </p>
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold",
                              STEP_VARIANT_CLASSES[activeVariant].badgeActive,
                              STEP_VARIANT_CLASSES[activeVariant].badgeActiveText,
                            )}
                          >
                            <span
                              className={cn(
                                "h-2.5 w-2.5 rounded-sm",
                                STEP_VARIANT_CLASSES[activeVariant].dot,
                              )}
                            />
                            {STEP_VARIANT_LABELS[activeVariant]}
                          </div>
                          <h3 className="text-lg leading-tight font-semibold text-slate-900">
                            {activeStep.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {activeStep.description}
                          </p>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                            {activeStep.detail}
                          </div>
                          {activeStep.securityNote ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                              <p className="font-semibold uppercase tracking-wide">
                                Security Note
                              </p>
                              <p className="mt-1">{activeStep.securityNote}</p>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-transparent bg-transparent px-4 py-3 text-xs text-transparent">
                              <p className="font-semibold uppercase tracking-wide">
                                Security Note
                              </p>
                              <p className="mt-1">No security note for this step.</p>
                            </div>
                          )}
                        </div>

                        <section className="space-y-3 border-t border-slate-200 pt-4">
                          <div className="min-h-[5.5rem]">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Request Sample
                            </p>
                            {activeStep.requestSample ? (
                              <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-slate-100">
                                {activeStep.requestSample}
                              </pre>
                            ) : (
                              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                                No request payload for this step.
                              </div>
                            )}
                          </div>
                          <div className="min-h-[5.5rem]">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Response Sample
                            </p>
                            {activeStep.responseSample ? (
                              <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-slate-100">
                                {activeStep.responseSample}
                              </pre>
                            ) : (
                              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                                No response payload for this step.
                              </div>
                            )}
                          </div>
                        </section>
                      </div>
                    </div>
                  </section>

                  <details className="mt-4 border-t border-slate-200 pt-4">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Diagnostics
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs text-slate-500">
                      {debugEvents.length === 0 ? (
                        <li>No playback events captured yet.</li>
                      ) : (
                        debugEvents.map((event) => (
                          <li key={`${event.timestamp}-${event.type}`}>
                            [{event.type}] step {event.stepIndex + 1}
                          </li>
                        ))
                      )}
                    </ul>
                  </details>
                </aside>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
