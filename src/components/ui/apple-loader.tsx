import { useId } from "react";

const APPLE = "M60 38C52 30 34 32 30 52C26 74 40 94 52 94C56 94 58 92 60 92C62 92 64 94 68 94C80 94 94 74 90 52C86 32 68 30 60 38Z";

/**
 * The GBHPL apple, filling up like a bottle of cider. It takes its colour from the
 * surrounding text colour, so it works on gold buttons, white cards and the green
 * splash screen alike. Used for every loading state on the site.
 */
export function AppleLoader({ className = "h-12 w-12" }: { className?: string }) {
  const clip = useId();
  return (
    <svg className={`apple-loader ${className}`} viewBox="24 12 72 88" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path d={APPLE} />
        </clipPath>
      </defs>
      {/* outline */}
      <path d={APPLE} stroke="currentColor" strokeWidth="5" strokeLinejoin="round" opacity="0.35" />
      {/* juice rising inside the apple */}
      <g clipPath={`url(#${clip})`}>
        <rect className="apple-loader-fill" x="20" y="30" width="80" height="70" fill="currentColor" />
      </g>
      {/* stem and leaf */}
      <path d="M60 38C60 32 59 28 57 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path className="apple-loader-leaf" d="M62 34C62 24 70 18 82 18C82 29 74 35 62 34Z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

/** Full-area loading state: apple with a short label. Gold on dark, forest on light. */
export function PageLoader({ label = "Loading…", dark = false, className = "" }: { label?: string; dark?: boolean; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <AppleLoader className={`h-16 w-16 ${dark ? "text-brand-gold" : "text-brand-forest"}`} />
      <p className={`text-sm font-semibold ${dark ? "text-white/70" : "text-brand-forest/60"}`}>{label}</p>
    </div>
  );
}
