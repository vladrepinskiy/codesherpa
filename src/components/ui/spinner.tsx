import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-primary ${sizeClasses[size]}`}
      >
        <span className='sr-only'>Loading...</span>
      </div>
    </div>
  );
}
