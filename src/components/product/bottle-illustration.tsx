import React from "react";

interface BottleIllustrationProps {
  className?: string;
  size?: string;
  volumeMl?: number;
}

export function BottleIllustration({
  className = "w-48 h-auto",
  size = "500ml",
  volumeMl,
}: BottleIllustrationProps) {
  const isLarge =
    (volumeMl !== undefined && volumeMl >= 1000) ||
    /1000|1\s*l|2\s*l|3\s*l|family/i.test(size || "");
  const sizeLabel = size || (volumeMl ? `${volumeMl}ml` : "500ml");

  return (
    <svg
      viewBox="0 0 260 440"
      className={className}
      role="img"
      aria-label={`Illustration of Gid’s Apple Cider Vinegar ${size} bottle`}
    >
      <defs>
        <linearGradient id="glassGradient" x1="0" x2="1">
          <stop stopColor="#5d321c" />
          <stop offset="0.22" stopColor="#a85a20" />
          <stop offset="0.52" stopColor="#c27729" />
          <stop offset="0.82" stopColor="#793b1a" />
          <stop offset="1" stopColor="#492619" />
        </linearGradient>
        <linearGradient id="neckGradient" x1="0" x2="1">
          <stop stopColor="#70401f" />
          <stop offset="0.5" stopColor="#c88036" />
          <stop offset="1" stopColor="#55301c" />
        </linearGradient>
        <linearGradient id="labelGradient" x1="0" x2="1">
          <stop stopColor="#fdfbf5" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f5efe0" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse
        cx="130"
        cy="422"
        rx={isLarge ? "82" : "74"}
        ry="8"
        fill="#482718"
        opacity="0.28"
      />

      {/* Bottle Body */}
      <path
        d="M94 27c0-4 3-7 7-7h58c4 0 7 3 7 7v38c0 5 2 10 6 14 17 16 24 32 24 61v241c0 19-12 31-31 31H95c-19 0-31-12-31-31V140c0-29 7-45 24-61 4-4 6-9 6-14V27Z"
        fill="url(#glassGradient)"
        stroke="#482719"
        strokeWidth="3.5"
      />

      {/* Neck Band */}
      <path d="M97 71h66v20H97z" fill="url(#neckGradient)" />

      {/* Cap */}
      <path
        d="M101 9h58c5 0 8 4 8 8v24H93V17c0-4 3-8 8-8Z"
        fill="#1e3e33"
        stroke="#142c24"
        strokeWidth="2.5"
      />
      <path
        d="M96 19h67M96 27h67"
        stroke="#5a8070"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Label Base */}
      <path
        d="M74 150c0-14 11-25 25-25h62c14 0 25 11 25 25v160c0 13-10 23-23 23H97c-13 0-23-10-23-23V150Z"
        fill="url(#labelGradient)"
        stroke="#e8dec6"
        strokeWidth="1.5"
      />
      <path d="M74 176h112" stroke="#f2673a" strokeWidth="2.5" />

      {/* Label Text */}
      <text
        x="130"
        y="166"
        textAnchor="middle"
        fill="#173f35"
        fontFamily="Georgia, serif"
        fontSize="12"
        fontWeight="bold"
        letterSpacing="2.5"
      >
        GID’S
      </text>

      <text
        x="130"
        y="212"
        textAnchor="middle"
        fill="#1c2024"
        fontFamily="Georgia, serif"
        fontSize="19"
        fontWeight="bold"
        letterSpacing="0.5"
      >
        APPLE CIDER
      </text>

      <text
        x="130"
        y="235"
        textAnchor="middle"
        fill="#1c2024"
        fontFamily="Georgia, serif"
        fontSize="19"
        fontWeight="bold"
        letterSpacing="0.5"
      >
        VINEGAR
      </text>

      {/* Leaf icon badge */}
      <circle cx="130" cy="270" r="17" fill="#fdf0ea" />
      <path
        d="M130 257v24m-11-18c7-4 13-4 22 0m-22 9c7-4 13-4 22 0"
        stroke="#3c7457"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      <text
        x="130"
        y="306"
        textAnchor="middle"
        fill="#8d562b"
        fontSize="8"
        fontFamily="sans-serif"
        fontWeight="bold"
        letterSpacing="1.2"
      >
        {sizeLabel.toUpperCase()} · RAW & UNFILTERED
      </text>

      <text
        x="130"
        y="322"
        textAnchor="middle"
        fill="#66736b"
        fontSize="7"
        fontFamily="sans-serif"
      >
        CAPE COAST, GHANA
      </text>
    </svg>
  );
}
