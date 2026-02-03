interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel: string;
  rightLabel: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  leftLabel,
  rightLabel,
}: ToggleSwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div
        className={`relative h-10 w-40 rounded-full transition-colors duration-300 ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        {/* Left label */}
        <span
          className={`absolute top-1/2 left-3 z-0 -translate-y-1/2 text-sm font-medium transition-colors duration-300 ${
            checked ? "text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {leftLabel}
        </span>
        {/* Right label */}
        <span
          className={`absolute top-1/2 right-3 z-0 -translate-y-1/2 text-sm font-medium transition-colors duration-300 ${
            checked ? "text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {rightLabel}
        </span>
        {/* Toggle circle */}
        <div
          className={`absolute top-1 left-1 z-10 flex h-8 w-20 items-center justify-center rounded-full border border-border bg-background shadow-md transition-all duration-300 ${
            checked ? "translate-x-[4.45rem]" : "translate-x-0"
          }`}
        >
          <span className="text-xs font-semibold text-foreground">
            {checked ? rightLabel : leftLabel}
          </span>
        </div>
      </div>
    </label>
  );
}
