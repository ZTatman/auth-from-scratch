import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UserProvider } from "../../UserContext/UserContext";
import { AuthFlowsPage } from "../AuthFlowsPage";

vi.mock("@xyflow/react/dist/style.css", () => ({}));
vi.mock("motion/react", async () => {
  const React = await import("react");

  const motionProxy = new Proxy(
    {},
    {
      get: (_, elementName: string | symbol) => {
        if (typeof elementName !== "string") {
          return undefined;
        }

        return ({
          children,
          ...props
        }: {
          children?: React.ReactNode;
          [key: string]: unknown;
        }) => {
          const strippedProps = {
            ...props,
          };

          delete strippedProps.animate;
          delete strippedProps.exit;
          delete strippedProps.initial;
          delete strippedProps.transition;

          return React.createElement(elementName, strippedProps, children);
        };
      },
    },
  );

  return {
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
      <>{children}</>
    ),
    useReducedMotion: () => false,
    motion: motionProxy,
  };
});

vi.mock("@xyflow/react", async () => {
  return {
    ReactFlow: ({ children }: { children?: import("react").ReactNode }) => (
      <div data-testid="react-flow">{children}</div>
    ),
    Background: () => null,
    Controls: () => null,
    Handle: () => <div data-testid="handle" />,
    Position: { Left: "left", Right: "right" },
    MarkerType: { ArrowClosed: "arrowclosed" },
    BaseEdge: ({ path }: { path: string }) => (
      <path data-testid="edge" d={path} />
    ),
    getStraightPath: ({
      sourceX,
      sourceY,
      targetX,
      targetY,
    }: {
      sourceX: number;
      sourceY: number;
      targetX: number;
      targetY: number;
    }) => {
      const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
      return [path, (sourceX + targetX) / 2, (sourceY + targetY) / 2] as const;
    },
  };
});

function renderAuthFlows() {
  return render(
    <MemoryRouter>
      <UserProvider>
        <AuthFlowsPage />
      </UserProvider>
    </MemoryRouter>,
  );
}

function getTimelineStepButton(name: RegExp): HTMLButtonElement {
  const selectorContainer = screen.getByTestId("timeline-step-selectors");
  if (!selectorContainer) {
    throw new Error("Could not find timeline step selector container");
  }

  return within(selectorContainer).getByRole("button", { name });
}

describe("AuthFlowsPage", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("highlights the active step with the node color", () => {
    renderAuthFlows();

    const outlineButton = getTimelineStepButton(/Client sends login request/i);
    expect(outlineButton.className).toContain("bg-sky-500");
    expect(outlineButton.textContent).toContain("1. Client sends login request");
  });

  it("auto-plays between steps", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(Date.now()), 16),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) =>
      window.clearTimeout(id),
    );

    renderAuthFlows();

    fireEvent.click(screen.getByRole("checkbox", { name: /canvas autoplay/i }));
    fireEvent.click(screen.getByRole("button", { name: /play animation/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    const nextStepButton = getTimelineStepButton(/Database lookup/i);
    expect(nextStepButton.className).toContain("bg-amber-400");

    const pauseButton = screen.getByRole("button", { name: /pause animation/i });
    expect(pauseButton).toBeTruthy();
  });

  it("keeps autoplay off by default", () => {
    renderAuthFlows();

    const canvasAutoplay = screen.getByRole("checkbox", {
      name: /canvas autoplay/i,
    }) as HTMLInputElement;

    expect(canvasAutoplay.checked).toBe(false);
  });

  it("allows step selection from timeline selectors", async () => {
    const user = userEvent.setup();
    renderAuthFlows();

    const outlineButton = getTimelineStepButton(/JWT stored in localStorage/i);
    await user.click(outlineButton);

    expect(outlineButton.className).toContain("bg-cyan-500");

    const activeHeading = screen.getByRole("heading", {
      level: 3,
      name: /JWT stored in localStorage/i,
    });
    expect(activeHeading).toBeTruthy();
  });

  it("scrubs timeline and synchronizes active step", () => {
    renderAuthFlows();

    const timeline = screen.getByRole("slider", { name: /auth flow timeline/i });
    fireEvent.change(timeline, { target: { value: "80" } });

    const activeOutlineStep = getTimelineStepButton(/JWT stored in localStorage/i);
    expect(activeOutlineStep.className).toContain("bg-cyan-500");
  });

  it("advances one step when clicking next", async () => {
    const user = userEvent.setup();
    renderAuthFlows();

    await user.click(screen.getByRole("button", { name: /next step/i }));

    const activeOutlineStep = getTimelineStepButton(/Database lookup/i);
    expect(activeOutlineStep.className).toContain("bg-amber-400");
  });

  it("moves back one step when clicking back", async () => {
    const user = userEvent.setup();
    renderAuthFlows();

    await user.click(screen.getByRole("button", { name: /next step/i }));
    await user.click(screen.getByRole("button", { name: /previous step/i }));

    const activeOutlineStep = getTimelineStepButton(/Client sends login request/i);
    expect(activeOutlineStep.className).toContain("bg-sky-500");
  });

  it("loads another flow definition when tab changes", async () => {
    const user = userEvent.setup();
    renderAuthFlows();

    await user.click(screen.getByRole("tab", { name: /oauth/i }));

    expect(screen.getByText(/OAuth 2.1 Authorization Code/i)).toBeTruthy();
    const activeOutlineStep = getTimelineStepButton(
      /Client starts authorization request/i,
    );
    expect(activeOutlineStep.className).toContain("bg-violet-500");
  });
});
