import Image from "next/image";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-brand-forest"
    >
      <Image src="/brand/logo-mark.svg" alt="" width={72} height={72} className="h-[72px] w-[72px] animate-pulse" priority />
      <div className="h-1 w-28 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-1/2 animate-[loadbar_1s_ease-in-out_infinite] rounded-full bg-brand-gold" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
