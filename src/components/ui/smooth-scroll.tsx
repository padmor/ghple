"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Eased, inertial page scrolling. Skipped for visitors who prefer reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -72 }, // clear the fixed header on #section links
      // Let dialogs, the cart sheet and inner scrollers scroll on their own
      prevent: (node) => !!node.closest('[role="dialog"], [data-lenis-prevent]'),
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
