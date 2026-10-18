import Link from "next/link";

export const metadata = { title: "Return Policy | GBHPL" };

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-brand-forest text-white/70">
      <div className="section-container max-w-2xl py-24">
        <Link href="/" className="text-xs text-brand-gold hover:underline">
          ← Back to store
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white">Return Policy</h1>
        <p className="mt-4 text-sm leading-relaxed">
          GBHPL&apos;s return, exchange and refund rules are being finalised and will be published
          here. If you have an issue with an order in the meantime, please contact us at{" "}
          <a href="mailto:hello@gbhpl.com" className="text-brand-gold hover:underline">
            hello@gbhpl.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
