import { clientIp, fail, json, limited } from "@/server/http";

export const dynamic = "force-dynamic";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; street?: string; housenumber?: string; district?: string; city?: string; county?: string; state?: string };
}

/** Address suggestions for Ghana while a customer types. Uses the free OpenStreetMap-based Photon search. */
export async function GET(req: Request) {
  if (limited(`places:${clientIp(req)}`, 90, 60_000)) return fail("Too many requests", 429);

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 3) return json([]);

  try {
    // bbox keeps results inside Ghana
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en&bbox=-3.3,4.6,1.3,11.2`,
      { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "GBHPL-storefront" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return json([]);
    const data = (await res.json()) as { features?: PhotonFeature[] };

    const seen = new Set<string>();
    const out = [];
    for (const f of data.features ?? []) {
      const p = f.properties;
      const street = [p.housenumber, p.street].filter(Boolean).join(" ");
      const label = [p.name, street, p.district, p.city ?? p.county, p.state].filter((v, i, a) => v && a.indexOf(v) === i).join(", ");
      if (!label || seen.has(label)) continue;
      seen.add(label);
      out.push({ label, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] });
    }
    return json(out);
  } catch {
    return json([]);
  }
}
