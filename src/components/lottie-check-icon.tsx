"use client";

import React from "react";

type LottieCheckIconProps = {
  size?: number;
  tone?: "gold" | "forest";
};

export function LottieCheckIcon({ size = 28, tone = "forest" }: LottieCheckIconProps) {
  const src = tone === "gold"
    ? "/lottie/check-circle-gold.json"
    : "/lottie/check-circle-forest.json";

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      {React.createElement("dotlottie-wc", {
        src,
        autoplay: "true",
        loop: "true",
        speed: "0.72",
        mode: "forward",
        style: { width: "100%", height: "100%", display: "block" },
      })}
    </span>
  );
}
