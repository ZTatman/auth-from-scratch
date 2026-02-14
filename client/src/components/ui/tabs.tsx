import * as React from "react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "./button-variants";

interface TabsContextValue {
  baseId: string;
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

/**
 * Root tabs component that manages active tab state.
 *
 * @param defaultValue - Initial active tab value when uncontrolled
 * @param value - Controlled active tab value
 * @param onValueChange - Callback when active tab changes
 * @returns Tabs provider wrapping tab list and panels
 */
function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}): React.ReactElement {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? "",
  );
  const baseId = React.useId();
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : uncontrolledValue;

  const setValue = (nextValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <TabsContext.Provider value={{ baseId, value: activeValue, setValue }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      role="tablist"
      className={cn(
        "bg-muted/40 inline-flex flex-wrap items-center gap-2 rounded-lg p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  value: string;
}): React.ReactElement {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  const isActive = context.value === value;
  const tabId = `${context.baseId}-tab-${value}`;
  const panelId = `${context.baseId}-panel-${value}`;

  return (
    <button
      type="button"
      id={tabId}
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "border-transparent transition-colors",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          : "bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      onClick={() => context.setValue(value)}
      {...props}
    />
  );
}

function TabsContent({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  value: string;
}): React.ReactElement {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }
  const isActive = context.value === value;
  const tabId = `${context.baseId}-tab-${value}`;
  const panelId = `${context.baseId}-panel-${value}`;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      className={cn(isActive ? "block" : "hidden", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
