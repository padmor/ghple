"use client";

import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { ArrowRight } from "@/components/ui/icons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OPENINGS } from "@/data/home";

export function CareersSection() {
  const [joinRole, setJoinRole] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [sending, setSending] = useState<"" | "join">("");

  return (
    <>
        <section className="bg-brand-ivory py-14 sm:py-20" id="join">
          <div className="section-container">
            <div className="max-w-xl">
              <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                Careers
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-forest">Join GBHPL</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-forest/60">
                Build a career with purpose or partner with us.
              </p>
            </div>

            <h3 className="mt-8 text-lg font-bold text-brand-forest">Current openings</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {OPENINGS.map((o) => (
                <div
                  key={o.role}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-brand-forest/10 bg-white p-5 transition-shadow hover:shadow-lg"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-brand-forest">{o.title}</p>
                    <p className="mt-1 text-xs text-brand-forest/60">{o.meta}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setJoinRole(o.role);
                      setJoinOpen(true);
                    }}
                    className="flex-shrink-0 rounded-full bg-brand-forest px-4 py-2 text-xs font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-forest focus-ring"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setJoinRole("General Application");
                setJoinOpen(true);
              }}
              className="mt-5 text-sm font-semibold text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold focus-ring rounded"
            >
              Don&apos;t see your role? Send a general application
            </button>
          </div>

          {/* Application modal */}
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogContent className="max-w-md bg-white text-black">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-black">Apply to GBHPL</DialogTitle>
                <DialogDescription className="text-black/60">
                  Tell us a little about yourself.
                </DialogDescription>
              </DialogHeader>

              <form
                noValidate
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (sending) return;
                  const f = new FormData(e.currentTarget);
                  setSending("join");
                  try {
                    await api.forms.submit({
                      kind: "application",
                      fields: {
                        name: String(f.get("name") ?? ""),
                        email: String(f.get("email") ?? ""),
                        phone: String(f.get("phone") ?? ""),
                        role: String(f.get("role") ?? ""),
                        message: String(f.get("message") ?? ""),
                      },
                    });
                    setJoinOpen(false);
                  } finally {
                    setSending("");
                  }
                }}
              >
                <select
                  name="role"
                  value={joinRole}
                  onChange={(e) => setJoinRole(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  {OPENINGS.map((o) => (
                    <option key={o.role} value={o.role}>
                      {o.title}
                    </option>
                  ))}
                  <option value="General Application">General application</option>
                </select>
                <input
                  name="name"
                  placeholder="Full name"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <input
                  name="email"
                  type="text" inputMode="email"
                  placeholder="Email address"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <textarea
                  name="message"
                  rows={3}
                  placeholder="A short note about you"
                  className="w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <button
                  type="submit"
                  disabled={!!sending}
                  className="btn-gold w-full justify-center gap-2 py-3 text-sm font-bold disabled:cursor-wait disabled:opacity-80"
                >
                  <span>{sending === "join" ? "Sending…" : "Send application"}</span>
                  {sending === "join" ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
                </button>
                <p className="text-center text-[11px] text-black/50">
                  Opens your email app, ready to send to hello@gbhpl.com.
                </p>
              </form>
            </DialogContent>
          </Dialog>
        </section>
    </>
  );
}
