"use client";

import Image from "next/image";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-forest px-6 text-center text-white">
      <Image src="/brand/logo-mark.svg" alt="" width={72} height={72} className="h-[72px] w-[72px]" />
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">We hit a snag</h1>
      <p className="mt-3 max-w-md text-sm text-white/70">
        This page didn&apos;t load properly. Try again, and if it keeps happening, message us on WhatsApp.
      </p>
      <button onClick={reset} className="btn-gold mt-7 px-6 py-3 text-sm font-bold">
        Try again
      </button>
    </main>
  );
}
