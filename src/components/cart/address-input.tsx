"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Check } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import type { OrderLocation } from "@/types/store";

interface Props {
  /** What the customer types about their exact place (house, landmark, directions) */
  place: string;
  onPlace: (text: string) => void;
  /** The point on the map found by GPS or picked from suggestions */
  location: OrderLocation | null;
  onLocation: (loc: OrderLocation | null) => void;
}

/**
 * Two steps, so the rider gets both: (1) the map spot, found automatically or searched,
 * and (2) the customer's own words for the exact place. The second is never filled in
 * from the map, because a map name rarely says "blue gate behind the church".
 */
export function AddressInput({ place, onPlace, location, onLocation }: Props) {
  const [search, setSearch] = useState(location?.label ?? "");
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const typed = useRef(false);
  const touched = useRef(false);

  // Look up suggestions shortly after the customer stops typing in the map search
  useEffect(() => {
    if (!typed.current) return;
    const text = search.trim();
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    let stale = false;
    const t = setTimeout(async () => {
      const found = await api.places.search(text);
      if (!stale) {
        setSuggestions(found);
        setOpen(found.length > 0);
      }
    }, 350);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [search]);

  const pick = (s: { label: string; lat: number; lng: number }) => {
    typed.current = false;
    setSearch(s.label);
    onLocation({ lat: s.lat, lng: s.lng, label: s.label });
    setSuggestions([]);
    setOpen(false);
  };

  // `auto` is the silent attempt when the form opens: it stays quiet if location is blocked
  const locate = (auto = false) => {
    if (!auto) setGeoError("");
    if (!("geolocation" in navigator)) {
      if (!auto) setGeoError("Your browser can't share its location. Search for your area instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const label = await api.places.reverse(lat, lng);
        setLocating(false);
        if (auto && touched.current) return;
        typed.current = false;
        setSearch(label);
        onLocation({ lat, lng, label: label || undefined });
      },
      (err) => {
        setLocating(false);
        if (auto) return;
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location is blocked. Allow it in your browser, or search for your area."
            : "We couldn't find your location. Search for your area instead."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  // Find the customer as soon as the delivery form opens
  useEffect(() => {
    if (!location) locate(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      {/* 1. The map spot */}
      <div className="space-y-1.5">
        <label htmlFor="mapSearch" className="block text-xs font-semibold text-brand-forest/80">
          Your location on the map
        </label>
        <div className="relative">
          <input
            id="mapSearch"
            value={search}
            autoComplete="off"
            onChange={(e) => {
              typed.current = true;
              touched.current = true;
              setSearch(e.target.value);
            }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search your area or town…"
            className="form-input"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
          />
          {open && suggestions.length > 0 && (
            <ul role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-xl">
              {suggestions.map((s) => (
                <li key={s.label + s.lat}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(s)}
                    className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-brand-forest hover:bg-brand-gold/10"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                    <span>{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              locate(false);
            }}
            disabled={locating}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-forest/15 bg-white px-3 py-1.5 text-xs font-bold text-brand-forest transition-colors hover:border-brand-gold focus-ring disabled:cursor-wait disabled:opacity-70"
          >
            {locating ? <Spinner className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {locating ? "Finding your location…" : location ? "Update my location" : "Use my current location"}
          </button>
          {location && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Pinned on the map
              <button
                type="button"
                onClick={() => {
                  onLocation(null);
                  setSearch("");
                  touched.current = true;
                }}
                className="ml-1 font-bold text-brand-forest/60 underline"
              >
                Not here?
              </button>
            </span>
          )}
        </div>
        {geoError && <p className="text-xs text-red-600">{geoError}</p>}
      </div>

      {/* 2. The customer's own description of the exact place */}
      <div className="space-y-1">
        <label htmlFor="deliveryAddress" className="block text-xs font-semibold text-brand-forest/80">
          Your exact place <span className="font-normal text-brand-forest/50">(house number, landmark, directions)</span>
        </label>
        <input
          id="deliveryAddress"
          value={place}
          autoComplete="street-address"
          onChange={(e) => onPlace(e.target.value)}
          placeholder="e.g. House 12, blue gate opposite the church"
          className={`form-input ${location && !place.trim() ? "border-brand-gold ring-1 ring-brand-gold/50" : ""}`}
        />
        {location && !place.trim() && (
          <p className="text-xs text-brand-forest/60">The map shows the area. Tell the rider the exact spot.</p>
        )}
      </div>
    </div>
  );
}
