"use client";

import React, { useEffect, useRef } from "react";

/** Fades a block up into place the first time it scrolls into view. */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen when the page loads: leave it alone
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.classList.add("reveal");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("reveal-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{children}</div>;
}
