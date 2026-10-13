"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, Star } from "lucide-react";

export function SupportSection() {
  const [sending, setSending] = useState<"" | "feedback">("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);

  return (
    <>
        <section className="bg-brand-ivory py-14 sm:py-20" id="support">
          <div className="section-container">
            <div className="max-w-xl">
              <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                Support
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-forest">
                Help &amp; feedback
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-forest/60">
                Need a hand with an order, or want to tell us how we&apos;re doing?
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Contact options */}
              <div className="lg:col-span-5">
                <ul className="divide-y divide-brand-forest/10 overflow-hidden rounded-2xl border border-brand-forest/10 bg-white">
                  {[
                    {
                      href: "https://wa.me/233507154818?text=Hello%20GBHPL%2C%20I%20need%20help%20with%20my%20order.",
                      title: "WhatsApp",
                      sub: "Fastest way to reach us",
                      icon: "/icons/contact/contact-chat.svg",
                    },
                    {
                      href: "mailto:hello@gbhpl.com?subject=Support%20request",
                      title: "Email",
                      sub: "hello@gbhpl.com",
                      icon: "/icons/contact/contact-email.svg",
                    },
                    {
                      href: "tel:+233507154818",
                      title: "Phone",
                      sub: "+233 50 715 4818",
                      icon: "/icons/contact/contact-phone.svg",
                    },
                  ].map(({ href, title, sub, icon }) => (
                    <li key={title}>
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-ivory focus-ring"
                      >
                        <Image src={icon} alt="" width={40} height={40} className="h-10 w-10 flex-shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-brand-forest">{title}</span>
                          <span className="block truncate text-xs text-brand-forest/60">{sub}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-brand-forest/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-gold" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rate & comment */}
              <form
                noValidate
                className="rounded-2xl border border-brand-forest/10 bg-white p-5 sm:p-6 lg:col-span-7"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (sending) return;
                  const f = new FormData(e.currentTarget);
                  setSending("feedback");
                  const body = [
                    `Rating: ${feedbackRating}/5`,
                    `Name: ${f.get("name")}`,
                    "",
                    `${f.get("comment")}`,
                  ].join("\n");
                  setTimeout(() => {
                    window.location.href = `mailto:hello@gbhpl.com?subject=${encodeURIComponent(
                      `Feedback: ${feedbackRating}/5 stars`
                    )}&body=${encodeURIComponent(body)}`;
                    setSending("");
                  }, 400);
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-brand-forest">Rate us</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center" role="radiogroup" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const lit = n <= (feedbackHover || feedbackRating);
                        return (
                          <button
                            key={n}
                            type="button"
                            role="radio"
                            aria-checked={feedbackRating === n}
                            aria-label={`${n} star${n > 1 ? "s" : ""}`}
                            onClick={() => setFeedbackRating(n)}
                            onMouseEnter={() => setFeedbackHover(n)}
                            onMouseLeave={() => setFeedbackHover(0)}
                            className="rounded p-0.5 focus-ring"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                lit ? "fill-brand-gold text-brand-gold" : "text-brand-forest/20"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-16 text-xs text-brand-forest/60">
                      {["", "Poor", "Fair", "Good", "Very good", "Excellent"][
                        feedbackHover || feedbackRating
                      ]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    name="name"
                    placeholder="Your name"
                    className="w-full rounded-lg border border-brand-forest/15 bg-white px-3.5 py-2.5 text-sm text-black outline-none placeholder:text-brand-forest/40 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 sm:col-span-2"
                  />
                  <textarea
                    name="comment"
                    rows={3}
                    placeholder="Your comment or question"
                    className="w-full resize-none rounded-lg border border-brand-forest/15 bg-white px-3.5 py-2.5 text-sm text-black outline-none placeholder:text-brand-forest/40 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 sm:col-span-2"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-brand-forest/50">
                    Opens your email app, ready to send to hello@gbhpl.com.
                  </p>
                  <button
                    type="submit"
                    disabled={!!sending}
                    className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold disabled:cursor-wait disabled:opacity-80"
                  >
                    <span>{sending === "feedback" ? "Sending…" : "Send feedback"}</span>
                    {sending === "feedback" ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
    </>
  );
}
