"use client";
import { ICONS } from "@/lib/constants";

export default function Icon({
  name, color = "currentColor", size = 21, strokeWidth = 1.9,
}: { name: string; color?: string; size?: number; strokeWidth?: number }) {
  const paths = ICONS[name] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
