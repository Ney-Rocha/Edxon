import React from 'react';

interface DxonLogoProps {
  className?: string;
}

export default function DxonLogo({ className = "h-8 w-8" }: DxonLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      fill="none"
    >
      {/* Outer green square with thick border */}
      <rect
        x="9"
        y="9"
        width="82"
        height="82"
        stroke="#00ED2D"
        strokeWidth="11"
        strokeLinejoin="miter"
      />
      
      {/* Inside square nodes */}
      {/* Upper-left square node */}
      <rect x="23" y="39" width="14" height="14" fill="#00ED2D" />
      {/* Lower-left square node */}
      <rect x="23" y="60" width="14" height="14" fill="#00ED2D" />
      {/* Upper-right square node */}
      <rect x="62" y="32" width="14" height="14" fill="#00ED2D" />
      {/* Lower-right square node */}
      <rect x="62" y="60" width="14" height="14" fill="#00ED2D" />
      
      {/* Connecting lines */}
      {/* Diagonal from upper-left to upper-right */}
      <path
        d="M 37 46 L 62 39"
        stroke="#00ED2D"
        strokeWidth="8"
        strokeLinecap="square"
      />
      {/* Diagonal branching from upper-left down-right to lower-right */}
      <path
        d="M 37 46 L 62 67"
        stroke="#00ED2D"
        strokeWidth="8"
        strokeLinecap="square"
      />
    </svg>
  );
}
