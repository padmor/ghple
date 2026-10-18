import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "GBHPL Brand Guide" };

const COLORS = [
  { name: "Forest", hex: "#1A3320", role: "Primary. Headers, footers, logo tile, body headings", text: "text-white" },
  { name: "Palm Gold", hex: "#D4A017", role: "Accent. Buttons, highlights, the apple", text: "text-brand-forest" },
  { name: "Gold Deep", hex: "#A07A10", role: "Pressed states, small gold text on light", text: "text-white" },
  { name: "Leaf Sage", hex: "#7A9E6E", role: "Leaf, icons, soft borders", text: "text-brand-forest" },
  { name: "Ivory", hex: "#FFF8F0", role: "Light backgrounds, cards", text: "text-brand-forest" },
  { name: "Terracotta", hex: "#C65D2A", role: "Badges and alerts only", text: "text-white" },
];

const VOICE = [
  { t: "Honest", d: "Say what is in the bottle: raw, unfiltered, with the Mother. No hype words." },
  { t: "Warm", d: "Speak like a Cape Coast neighbour, not a lab. Short sentences, plain words." },
  { t: "Proud", d: "Made by hand, in Ghana, since 2018. Say it once, clearly." },
];

export default function BrandPage() {
  return (
    <main className="min-h-screen bg-brand-ivory text-brand-forest">
      <header className="bg-brand-forest">
        <div className="section-container flex items-center justify-between py-5">
          <Image src="/brand/logo-primary-light.svg" alt="GBHPL" width={180} height={60} className="h-12 w-auto" priority />
          <Link href="/" className="text-sm font-semibold text-white/70 hover:text-brand-gold">
            Back to store
          </Link>
        </div>
        <div className="section-container pb-14 pt-6 sm:pb-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">Brand guide</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Raw. Golden. <span className="text-brand-gold">Grown in Ghana.</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            The idea behind the brand: a golden apple, a fresh green leaf and the letter G. Simple enough to stamp on a
            cap, warm enough to feel handmade.
          </p>
        </div>
      </header>

      <div className="section-container space-y-16 py-14 sm:space-y-20 sm:py-20">
        {/* Logo */}
        <section>
          <h2 className="text-2xl font-extrabold">Logo</h2>
          <p className="mt-2 max-w-xl text-sm text-brand-forest/70">
            A gold apple with a G cut into it, on a forest tile. The G is the first letter of Gid&apos;s and the
            company name. The leaf marks it as fresh and natural.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-center rounded-3xl border border-brand-forest/10 bg-white p-10">
              <Image src="/brand/logo-primary.svg" alt="Primary logo" width={300} height={100} />
            </div>
            <div className="flex items-center justify-center rounded-3xl bg-brand-forest p-10">
              <Image src="/brand/logo-primary-light.svg" alt="Primary logo on dark" width={300} height={100} />
            </div>
            <div className="flex items-center justify-center gap-6 rounded-3xl border border-brand-forest/10 bg-brand-ivory-dark p-10">
              <Image src="/brand/logo-mark.svg" alt="Logo mark" width={96} height={96} />
              <Image src="/brand/logo-mark.svg" alt="Logo mark small" width={48} height={48} />
              <Image src="/brand/logo-mark.svg" alt="Logo mark tiny" width={28} height={28} />
            </div>
            <div className="flex items-center justify-center rounded-3xl bg-brand-gold p-10">
              <Image src="/brand/logo-mark-mono.svg" alt="One-colour mark" width={96} height={96} />
            </div>
          </div>
          <ul className="mt-5 grid gap-2 text-sm text-brand-forest/70 sm:grid-cols-3">
            <li>Keep clear space equal to half the tile height on every side.</li>
            <li>Smallest size: 24px for the mark, 120px wide for the full logo.</li>
            <li>Never recolour the apple, stretch the mark or put it on a busy photo.</li>
          </ul>
        </section>

        {/* Colour */}
        <section>
          <h2 className="text-2xl font-extrabold">Colour</h2>
          <p className="mt-2 max-w-xl text-sm text-brand-forest/70">
            Forest green and gold are the brand. Use about 60% forest or ivory, 30% green tones and 10% gold, so gold
            always stands out.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="overflow-hidden rounded-2xl border border-brand-forest/10 bg-white">
                <div className={`h-24 p-3 text-sm font-bold ${c.text}`} style={{ backgroundColor: c.hex }}>
                  {c.name}
                </div>
                <div className="p-3">
                  <p className="font-mono text-xs font-bold">{c.hex}</p>
                  <p className="mt-1 text-xs text-brand-forest/60">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type */}
        <section>
          <h2 className="text-2xl font-extrabold">Typography</h2>
          <div className="mt-6 rounded-3xl border border-brand-forest/10 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold-deep">Outfit, the only typeface</p>
            <p className="mt-3 text-5xl font-extrabold">Aa Gid&apos;s</p>
            <div className="mt-6 space-y-3">
              <p className="text-3xl font-extrabold">Headlines: ExtraBold 800</p>
              <p className="text-lg font-semibold">Subheads: SemiBold 600</p>
              <p className="text-base">Body text: Regular 400, 16px, comfortable line height.</p>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold-deep">
                Labels: bold, small caps, wide spacing
              </p>
            </div>
          </div>
        </section>

        {/* Voice */}
        <section>
          <h2 className="text-2xl font-extrabold">Voice</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {VOICE.map((v) => (
              <div key={v.t} className="rounded-2xl border border-brand-forest/10 bg-white p-5">
                <h3 className="text-lg font-extrabold">{v.t}</h3>
                <p className="mt-1 text-sm text-brand-forest/70">{v.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-brand-forest p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Tagline</p>
            <p className="mt-2 text-2xl font-extrabold">Raw. Unfiltered. Real.</p>
            <p className="mt-1 text-sm text-white/60">Alternate: Handcrafted in Cape Coast.</p>
          </div>
        </section>

        {/* Components */}
        <section>
          <h2 className="text-2xl font-extrabold">In use</h2>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-3xl border border-brand-forest/10 bg-white p-6 sm:p-8">
            <button className="btn-gold px-6 py-3 text-sm font-bold">Add to cart</button>
            <button className="btn-forest-outline px-6 py-3 text-sm font-bold">Read more</button>
            <span className="rounded-full bg-brand-forest px-3 py-1 text-xs font-bold text-brand-gold">Raw &amp; unfiltered</span>
            <span className="rounded-full bg-brand-terracotta px-3 py-1 text-xs font-bold text-white">New</span>
          </div>
          <p className="mt-3 text-sm text-brand-forest/60">
            Rounded corners everywhere (pills for buttons, 24px for cards). Gold is for the one action you want people
            to take on each screen.
          </p>
        </section>
      </div>
    </main>
  );
}
