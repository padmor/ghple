import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { ManagerProvider } from "@/context/manager-context";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gid's Apple Cider Vinegar — GBHPL",
  description:
    "Raw, unfiltered apple cider vinegar handcrafted in Cape Coast, Ghana. Shop 500 ml and 1000 ml bottles with nationwide delivery and Mobile Money payment.",
  keywords: [
    "Apple Cider Vinegar Ghana",
    "Gid's ACV",
    "GBHPL",
    "Cape Coast",
    "Natural health Ghana",
    "Raw ACV with mother",
  ],
  authors: [{ name: "Gid's Beverages & Health Products Ltd" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1A3320",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GH" className={`${outfit.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <SmoothScroll />
        <ManagerProvider>
          <CartProvider>{children}</CartProvider>
        </ManagerProvider>
      </body>
    </html>
  );
}
