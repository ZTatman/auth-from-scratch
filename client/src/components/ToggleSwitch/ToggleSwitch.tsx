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
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        {/* Left label */}
        <span
          className={`absolute top-1/2 left-3 z-0 -translate-y-1/2 text-sm font-medium transition-colors duration-300 ${
            checked ? "text-white" : "text-gray-700"
          }`}
        >
          {leftLabel}
        </span>
        {/* Right label */}
        <span
          className={`absolute top-1/2 right-3 z-0 -translate-y-1/2 text-sm font-medium transition-colors duration-300 ${
            checked ? "text-gray-700" : "text-gray-700"
          }`}
        >
          {rightLabel}
        </span>
        {/* Toggle circle */}
        <div
          className={`absolute top-1 left-1 z-10 flex h-8 w-20 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md transition-all duration-300 ${
            checked ? "translate-x-[4.45rem]" : "translate-x-0"
          }`}
        >
          <span className="text-xs font-semibold text-gray-800">
            {checked ? rightLabel : leftLabel}
          </span>
        </div>
      </div>
    </label>
  );
}
