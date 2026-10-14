import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-forest px-6 text-center text-white">
      <Image src="/brand/logo-mark.svg" alt="" width={72} height={72} className="h-[72px] w-[72px]" />
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-brand-gold">Error 404</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">This page has gone missing</h1>
      <p className="mt-3 max-w-md text-sm text-white/70">
        The link may be old or mistyped. Head back to the store, or track an order you&apos;ve already placed.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-gold px-6 py-3 text-sm font-bold">
          Back to the store
        </Link>
        <Link
          href="/track"
          className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          Track an order
        </Link>
      </div>
    </main>
  );
}
