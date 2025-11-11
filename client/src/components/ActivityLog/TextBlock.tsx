interface TextBlockProps {
  label: string;
  value?: string;
  variant?: "success" | "error" | "normal";
}

const variantClassMap = {
  success: "text-green-500",
  error: "text-red-500",
  normal: "text-gray-500",
};

export function TextBlock({
  label,
  value,
  variant = "normal",
}: TextBlockProps) {
  if (!value) return null;
  return (
    <div>
      <span className="font-bold">{label}:</span>&nbsp;
      <span className={`font-normal ${variantClassMap[variant]}`}>{value}</span>
    </div>
  );
}
