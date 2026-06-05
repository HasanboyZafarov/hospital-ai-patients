import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
  dark?: boolean;
}

export function Skeleton({ width = "100%", height = 14, radius = 8, className, style, dark = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse ${className ?? ""}`}
      style={{
        width,
        height,
        borderRadius: radius,
        background: dark ? "rgba(255,255,255,0.08)" : "var(--border)",
        ...style,
      }}
    />
  );
}

export function SkeletonStyles() {
  return (
    <style>{`
      .skeleton-pulse {
        position: relative;
        overflow: hidden;
      }
      .skeleton-pulse::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
        transform: translateX(-100%);
        animation: skeleton-shimmer 1.4s ease-in-out infinite;
      }
      .skeleton-pulse.dark::after {
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
      }
      @keyframes skeleton-shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
  );
}
