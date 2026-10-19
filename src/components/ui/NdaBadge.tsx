import React from "react";

interface NdaBadgeProps {
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function NdaBadge({
  label = "NDA",
  className = "",
  size = "md",
}: NdaBadgeProps) {
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 backdrop-blur-xs ${
        isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      } ${className}`}
      title="Confidential client work - details protected by Non-Disclosure Agreement"
    >
      <span
        className={`icon-[lucide--lock] ${
          isSm ? "size-2.5" : "size-3.5"
        } inline-block shrink-0`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
