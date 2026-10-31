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
      className={`inline-flex items-center gap-1 rounded-md font-mono font-medium uppercase tracking-wider bg-zinc-900/80 text-white backdrop-blur-md border border-white/15 shadow-2xs ${
        isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      } ${className}`}
      title="Confidential client work - details protected by Non-Disclosure Agreement"
    >
      <span
        className={`icon-[lucide--lock] ${
          isSm ? "size-2.5" : "size-3"
        } inline-block shrink-0 text-zinc-300`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
