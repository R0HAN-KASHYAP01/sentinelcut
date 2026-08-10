'use client';
import { useState, useRef } from 'react';
export function DetectionHighlight({ detection, children, onClick, isSelected }) {
  // Determine color based on Confidence Scale (UI/UX Doc 3.2)
  let colorClass = "";
  if (detection.confidence >= 0.85) {
    colorClass = "bg-rose-500 text-white"; // High confidence (Solid Rose)
  } else if (detection.confidence >= 0.60) {
    colorClass = "bg-amber-500 text-white"; // Medium confidence (Solid Amber)
  } else {
    colorClass = "border border-amber-500 text-amber-600"; // Low confidence (Outline Amber)
  }

  // Determine Source Badge (UI/UX Doc 9.2)
  let sourceBadge = "M"; // Default to model
  if (detection.source === "dictionary") sourceBadge = "D";
  if (detection.source === "regex") sourceBadge = "R";

  return (
    <span 
      onClick={() => onClick(detection)}
      className={`relative inline-block mx-1 px-1 rounded cursor-pointer transition-all ${colorClass} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
    >
      {children}
      <sup className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
        {sourceBadge}
      </sup>
    </span>
  );
}