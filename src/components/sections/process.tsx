"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { PROCESS_STEPS } from "@/data/home";

export function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const processPanel = useRef<HTMLDivElement>(null);
  const [stepsPaused, setStepsPaused] = useState(false);
  const goToStep = (i: number) =>
    setActiveStep((i + PROCESS_STEPS.length) % PROCESS_STEPS.length);

  // Gently walk through the phases until the visitor takes over
  useEffect(() => {
    if (stepsPaused) return;
    const t = setTimeout(() => goToStep(activeStep + 1), 6000);
    return () => clearTimeout(t);
  }, [activeStep, stepsPaused]);

  return (
    <>
        <section className="bg-white py-24" id="process">
          <div className="section-container">
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
              onMouseEnter={() => setStepsPaused(true)}
              onMouseLeave={() => setStepsPaused(false)}
              onFocus={() => setStepsPaused(true)}
              onBlur={() => setStepsPaused(false)}
            >
              {/* Steps */}
              <div>
                <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                  From Soil to Seal
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-forest mt-2 mb-10">
                  The Architectural Process
                </h2>

                <div
                  className="relative"
                  role="tablist"
                  aria-orientation="vertical"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      goToStep(activeStep + 1);
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      goToStep(activeStep - 1);
                    }
                  }}
                >
                  {/* Track + progress that fills down to the active step */}
                  <div className="absolute left-[27px] top-7 bottom-7 w-[2px] bg-border" />
                  <div
                    className="absolute left-[27px] top-7 w-[2px] bg-brand-gold transition-all duration-500"
                    style={{
                      height: `calc((100% - 3.5rem) * ${activeStep / (PROCESS_STEPS.length - 1)})`,
                    }}
                  />

                  <div className="space-y-2">
                    {PROCESS_STEPS.map((step, i) => {
                      const active = i === activeStep;
                      const done = i < activeStep;
                      return (
                        <button
                          key={step.title}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          tabIndex={active ? 0 : -1}
                          onClick={() => {
                            goToStep(i);
                            if (window.innerWidth < 1024) {
                              processPanel.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className={`relative z-10 w-full flex items-center gap-5 p-3 rounded-2xl border text-left transition-all duration-300 focus-ring ${
                            active
                              ? "bg-brand-ivory border-brand-gold/60 shadow-lg"
                              : "border-transparent hover:bg-brand-ivory/60"
                          }`}
                        >
                          <span
                            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-300 ${
                              active
                                ? "border-brand-gold bg-brand-forest text-brand-gold scale-110"
                                : done
                                ? "border-brand-gold bg-brand-gold text-brand-forest"
                                : "border-gray-300 bg-white text-gray-400"
                            }`}
                          >
                            {done ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              String(i + 1).padStart(2, "0")
                            )}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block font-bold text-lg leading-tight transition-colors ${
                                active ? "text-brand-forest" : "text-gray-500"
                              }`}
                            >
                              {step.title}
                            </span>
                            <span className="block mt-0.5 text-xs text-brand-forest/50">
                              {step.specs.map((sp) => sp.val).join(" · ")}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detail panel */}
              <div ref={processPanel} className="relative h-[560px] sm:h-[500px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-brand-forest scroll-mt-24">
                <Image
                  key={PROCESS_STEPS[activeStep].image}
                  src={PROCESS_STEPS[activeStep].image}
                  alt={PROCESS_STEPS[activeStep].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-opacity duration-500"
                  priority={activeStep === 0}
                />
                <div className="absolute inset-0 bg-brand-forest/20" />
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />

                {/* Segmented progress */}
                <div className="absolute top-6 inset-x-10 flex gap-2 z-10">
                  {PROCESS_STEPS.map((step, i) => (
                    <button
                      key={step.title}
                      type="button"
                      aria-label={`Go to phase ${i + 1}`}
                      onClick={() => goToStep(i)}
                      className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden focus-ring"
                    >
                      <span
                        className={`block h-full rounded-full bg-brand-gold transition-all duration-500 ${
                          i <= activeStep ? "w-full" : "w-0"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Re-keyed so each phase fades in fresh */}
                <div
                  key={activeStep}
                  className="absolute inset-0 p-10 pt-16 flex flex-col justify-end animate-fade-in"
                  aria-live="polite"
                >
                  <div className="absolute top-14 right-10 text-[9rem] leading-none font-black text-white/[0.06] select-none">
                    {String(activeStep + 1).padStart(2, "0")}
                  </div>

                  <span className="self-start bg-brand-gold text-brand-forest text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Phase {String(activeStep + 1).padStart(2, "0")} of{" "}
                    {String(PROCESS_STEPS.length).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-3xl font-bold text-white">
                    {PROCESS_STEPS[activeStep].title}
                  </h3>
                  <p className="mt-3 text-base text-white/75 leading-relaxed min-h-[96px]">
                    {PROCESS_STEPS[activeStep].text}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {PROCESS_STEPS[activeStep].specs.map((sp) => (
                      <div
                        key={sp.label}
                        className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-sm"
                      >
                        <span className="block text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                          {sp.label}
                        </span>
                        <span className="block mt-1 text-sm font-bold text-white">{sp.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {stepsPaused ? "Paused" : "Auto-playing"} · use ← → keys
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => goToStep(activeStep - 1)}
                        aria-label="Previous phase"
                        className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white/10 flex items-center justify-center transition-colors focus-ring"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToStep(activeStep + 1)}
                        aria-label="Next phase"
                        className="w-10 h-10 rounded-full bg-brand-gold text-brand-forest hover:brightness-110 flex items-center justify-center transition-all focus-ring"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
