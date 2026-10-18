import { clientIp, fail, json, limited } from "@/server/http";

export const dynamic = "force-dynamic";

/** Turn a GPS position into a readable address (OpenStreetMap Nominatim). */
export async function GET(req: Request) {
  if (limited(`reverse:${clientIp(req)}`, 20, 60_000)) return fail("Too many requests", 429);

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return fail("Bad position");

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=0&lat=${lat}&lon=${lng}`,
      { signal: AbortSignal.timeout(6000), headers: { "User-Agent": "GBHPL-storefront (gbhpl.com)" }, cache: "no-store" }
    );
    if (!res.ok) return json({ label: "" });
    const data = (await res.json()) as { display_name?: string };
    // Drop the country at the end; everyone ordering is already in Ghana
    const label = (data.display_name ?? "").replace(/,\s*Ghana$/i, "");
    return json({ label });
  } catch {
    return json({ label: "" });
  }
}
