import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { getStoreContent } from "@/server/content";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { OrdersProvider } from "@/context/orders-context";
import { VisitTracker } from "@/components/ui/visit-tracker";
import { ManagerProvider } from "@/context/manager-context";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "GBHPL",
    locale: "en_GH",
    title: "Gid's Apple Cider Vinegar — GBHPL",
    description: "Raw, unfiltered apple cider vinegar handcrafted in Cape Coast, Ghana.",
    images: [{ url: "/images/backgrounds/hero-bg-v2.jpg", width: 1408, height: 768 }],
  },
  twitter: { card: "summary_large_image" },
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

// The storefront is rebuilt from the database at most once a minute, and straight away
// whenever the manager saves a change (see revalidatePath in the manager endpoints).
export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initial = await getStoreContent();

  return (
    <html lang="en-GH" className={`${outfit.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <SmoothScroll />
        <OrdersProvider>
          <VisitTracker />
          <ManagerProvider initial={initial}>
            <CartProvider>{children}</CartProvider>
          </ManagerProvider>
        </OrdersProvider>
      </body>
    </html>
  );
}
