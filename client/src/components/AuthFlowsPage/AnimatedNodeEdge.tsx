import { type CSSProperties, type ReactElement } from "react";
import { BaseEdge, type Edge, type EdgeProps } from "@xyflow/react";
import { motion } from "motion/react";

import type { FlowTokenType } from "./flow-script";

interface AnimatedNodeEdgeData extends Record<string, unknown> {
  progress?: number;
  isActive?: boolean;
  tokenType?: FlowTokenType;
  edgeColor?: string;
  emphasis?: number;
  rowY?: number;
  stepNumber?: number;
}

export type AnimatedNodeEdge = Edge<AnimatedNodeEdgeData, "animatedNode">;

const TOKEN_COLORS: Record<FlowTokenType, string> = {
  credentials: "#0ea5e9",
  "db-query": "#22c55e",
  "password-hash": "#f59e0b",
  jwt: "#06b6d4",
  bearer: "#6366f1",
  "auth-code": "#8b5cf6",
  "access-token": "#0ea5e9",
  "refresh-token": "#0284c7",
  "api-key": "#f97316",
};

/**
 * Custom edge that animates a token packet along a fixed sequence row.
 *
 * @param edgeProps - Edge data and positioning from React Flow
 * @returns SVG edge with animated token motion
 */
export function AnimatedNodeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
  style,
  interactionWidth,
  data,
}: EdgeProps<AnimatedNodeEdge>): ReactElement {
  const tokenType = data?.tokenType ?? "jwt";
  const tokenColor = data?.edgeColor ?? TOKEN_COLORS[tokenType];
  const clampedProgress =
    typeof data?.progress === "number"
      ? Math.min(Math.max(data.progress, 0), 1)
      : 0;
  const isActive = data?.isActive ?? false;
  const emphasis =
    typeof data?.emphasis === "number"
      ? Math.min(Math.max(data.emphasis, 0), 1)
      : 0.35;

  const rowY = data?.rowY ?? (sourceY + targetY) / 2;
  const path = `M ${sourceX},${rowY} L ${targetX},${rowY}`;
  const tokenX = sourceX + (targetX - sourceX) * clampedProgress;
  const labelX = sourceX + (targetX - sourceX) * 0.5;
  const labelY = rowY - 20;
  const stepNumber = data?.stepNumber;

  const edgeStyle: CSSProperties = {
    ...style,
    stroke: isActive ? tokenColor : style?.stroke,
    opacity: isActive ? 1 : emphasis,
    strokeWidth: isActive ? 3 : 2,
    transition: "stroke 240ms ease, opacity 240ms ease, stroke-width 240ms ease",
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerStart={markerStart}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth}
        style={edgeStyle}
      />
      {typeof stepNumber === "number" ? (
        <g transform={`translate(${labelX}, ${labelY})`} pointerEvents="none">
          <rect
            x={-16}
            y={-12}
            width={32}
            height={24}
            rx={6}
            fill={isActive ? tokenColor : "#ffffff"}
            fillOpacity={isActive ? 1 : 0.95}
            stroke={isActive ? tokenColor : "#cbd5e1"}
            strokeWidth={1}
          />
          <text
            x={0}
            y={1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="700"
            fill={isActive ? "#ffffff" : "#64748b"}
          >
            {stepNumber}
          </text>
        </g>
      ) : null}
      {isActive ? (
        <>
          <motion.circle
            cx={tokenX}
            cy={rowY}
            r={8}
            fill={tokenColor}
            fillOpacity={0.22}
            pointerEvents="none"
            initial={false}
            animate={{ opacity: 0.22, scale: 1 }}
            transition={{ duration: 0.16 }}
          />
          <motion.circle
            cx={tokenX}
            cy={rowY}
            r={4}
            fill={tokenColor}
            pointerEvents="none"
            initial={false}
            animate={{ opacity: 1, scale: [0.9, 1.05, 1] }}
            transition={{ duration: 0.2 }}
          />
        </>
      ) : null}
    </>
  );
}
