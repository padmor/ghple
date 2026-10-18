"use client";

import React from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@/components/ui/icons";

export const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30";

export function Icon({ name, className = "h-10 w-10" }: { name: string; className?: string }) {
  return <Image src={`/icons/manager/${name}.svg`} alt="" width={64} height={64} className={`flex-shrink-0 ${className}`} />;
}

export function PageHeader({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
      <div className="flex items-center gap-4">
        <Icon name={icon} className="h-12 w-12 sm:h-14 sm:w-14" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-0.5 text-sm text-white/65">{text}</p>
        </div>
      </div>
      {action}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-brand-navy-mid p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/60">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-white/45">{hint}</span>}
    </label>
  );
}

/** Themed modal: a centred card on desktop, a bottom sheet on phones. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" />
        <DialogPrimitive.Content
          className="manager-theme fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border border-white/10 bg-brand-navy-mid text-white shadow-2xl animate-sheet-up sm:inset-0 sm:m-auto sm:h-fit sm:w-[calc(100%-2rem)] sm:max-w-xl sm:rounded-3xl sm:animate-scale-in"
          data-lenis-prevent
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <DialogPrimitive.Title className="text-lg font-extrabold text-white">{title}</DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-sm text-white/60">{description}</DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-ring"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/85 transition-colors hover:border-white/40 hover:text-white focus-ring";
