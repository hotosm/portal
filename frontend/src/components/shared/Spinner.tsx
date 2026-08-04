interface SpinnerProps {
  size?: "sm" | "md";
  color?: "brand" | "white";
  label?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-3 w-3 border-2",
  md: "h-4 w-4 border-2",
};

const COLOR_CLASSES: Record<NonNullable<SpinnerProps["color"]>, string> = {
  brand: "border-hot-gray-300 border-t-hot-red",
  white: "border-white/40 border-t-white",
};

function Spinner({
  size = "sm",
  color = "brand",
  label,
  className = "",
}: SpinnerProps) {
  return (
    <span
      className={`inline-block animate-spin rounded-full ${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]} ${className}`}
      role="status"
      aria-label={label}
    />
  );
}

export default Spinner;
