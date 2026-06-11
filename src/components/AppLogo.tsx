"use client";
import React from "react";

/**
 * AppLogo - Renders the app name as a branded split-color logo.
 * Splits at "TV" or last 2 uppercase chars to create a two-tone effect
 * similar to beIN Sports / ESPN branding.
 */
export default function AppLogo({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" | "xl" }) {
  // Split the name into two parts - try to find "TV" or use last word
  let part1 = name;
  let part2 = "";
  
  const tvIndex = name.toUpperCase().lastIndexOf("TV");
  if (tvIndex > 0) {
    part1 = name.slice(0, tvIndex);
    part2 = name.slice(tvIndex);
  } else {
    const words = name.split(" ");
    if (words.length > 1) {
      part1 = words.slice(0, -1).join(" ");
      part2 = words[words.length - 1];
    }
  }

  const sizeClasses: Record<string, string> = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl lg:text-3xl",
    xl: "text-4xl md:text-5xl",
  };

  return (
    <span dir="ltr" className={`${sizeClasses[size]} font-black tracking-tight leading-none select-none inline-flex items-baseline gap-0`}>
      <span className="text-white">{part1}</span>
      {part2 && (
        <span
          className="bg-gradient-to-r from-[var(--color-primary-custom)] to-[#a855f7] bg-clip-text text-transparent"
        >
          {part2}
        </span>
      )}
    </span>
  );
}
