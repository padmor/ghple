import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order — GBHPL",
  description: "Enter your order ID to see where your vinegar is.",
  robots: { index: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
