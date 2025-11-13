import { useId } from "react";
import Tooltip from "./Tooltip";

export interface ProgressBarProps {
  firstValue: number; // percentMapped (gray)
  secondValue: number; // percentValidated (red)
  height?: string;
  className?: string;
  children?: React.ReactNode; // tooltip content
}

function ProgressBar({
  firstValue = 0,
  secondValue = 0,
  height = "10px",
  className = "",
  children,
}: ProgressBarProps) {
  const id = useId();

  return (
    <>
      <div className={`w-full ${className}`}>
        <div
          id={id}
          className="bg-hot-gray-100 rounded-xl overflow-hidden cursor-pointer"
          style={{ height }}
        >
          <div className="relative h-full">
            {/* Gray bar for percentMapped */}
            <div
              className="absolute top-0 left-0 h-full bg-hot-gray-400 transition-all duration-300"
              style={{ width: `${Math.min(firstValue, 100)}%` }}
              role="progressbar"
              aria-valuenow={firstValue}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            {/* Red bar for percentValidated */}
            <div
              className="absolute top-0 left-0 h-full bg-hot-red-500 transition-all duration-300"
              style={{ width: `${Math.min(secondValue, 100)}%` }}
              role="progressbar"
              aria-valuenow={secondValue}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {children && (
        <Tooltip htmlFor={id} placement="bottom">
          {children}
        </Tooltip>
      )}
    </>
  );
}

export default ProgressBar;
