"use client";

import { useEffect, useRef } from "react";

type AnimationItem = {
  destroy: () => void;
};

type LottieApi = {
  loadAnimation: (options: {
    container: HTMLElement;
    renderer: "svg";
    loop: boolean;
    autoplay: boolean;
    path: string;
    rendererSettings?: { preserveAspectRatio?: string };
  }) => AnimationItem;
};

declare global {
  interface Window {
    lottie?: LottieApi;
  }
}

const LOTTIE_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/lottie.min.js";
const LOTTIE_SCRIPT_INTEGRITY =
  "sha512-uOtp2vx2X/5+tLBEf5UoQyqwAkFZJBM5XwGa7BfXDnWR+wdpRvlSVzaIVcRe3tGNsStu6UMDCeXKEnr4IBT8gA==";

let lottieScriptPromise: Promise<void> | null = null;

function loadLottie(): Promise<void> {
  if (typeof window === "undefined" || window.lottie) {
    return Promise.resolve();
  }

  if (lottieScriptPromise) return lottieScriptPromise;

  lottieScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = LOTTIE_SCRIPT_URL;
    script.integrity = LOTTIE_SCRIPT_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.dataset.gbhplLottie = "true";
    script.onload = () => resolve();
    script.onerror = () => {
      lottieScriptPromise = null;
      reject(new Error("Unable to load the Lottie animation player."));
    };
    document.head.appendChild(script);
  });

  return lottieScriptPromise;
}

export function LottieIcon({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let animation: AnimationItem | undefined;

    loadLottie()
      .then(() => {
        const container = containerRef.current;
        if (cancelled || !container || !window.lottie) return;

        animation = window.lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          autoplay: true,
          path: src,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
      })
      .catch(() => {
        // Leave the card layout intact if the external animation player is blocked.
      });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
    />
  );
}
