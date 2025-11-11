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
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`relative w-40 h-10 rounded-full transition-colors duration-300 ${
          checked ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        {/* Left label */}
        <span
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors duration-300 z-0 ${
            checked ? "text-white" : "text-gray-700"
          }`}
        >
          {leftLabel}
        </span>
        {/* Right label */}
        <span
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors duration-300 z-0 ${
            checked ? "text-gray-700" : "text-gray-700"
          }`}
        >
          {rightLabel}
        </span>
        {/* Toggle circle */}
        <div
          className={`absolute top-1 left-1 bg-white border-gray-300 border rounded-full h-8 w-20 transition-all duration-300 shadow-md z-10 flex items-center justify-center ${
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
