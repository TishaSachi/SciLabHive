import React from "react";

const HexIcon = () => {
  return (
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="36,4 66,20 66,52 36,68 6,52 6,20"
        stroke="#4ade80"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon
        points="36,14 56,25 56,47 36,58 16,47 16,25"
        stroke="#4ade80"
        strokeWidth="1"
        strokeOpacity="0.35"
        fill="#4ade8008"
      />
      {/* Flask icon inside */}
      <path
        d="M30 22v10l-6 12h24l-6-12V22M28 22h16"
        stroke="#4ade80"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="40" r="1.5" fill="#4ade80" opacity="0.8" />
      <circle cx="38" cy="43" r="1" fill="#4ade80" opacity="0.5" />
    </svg>
  );
};

export default HexIcon;
