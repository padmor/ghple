# GBHPL Storefront (Next.js + Tailwind CSS + shadcn/ui)

A modern, responsive e-commerce storefront for **Gid’s Beverages & Health Products Ltd (GBHPL)** handcrafted in Cape Coast, Ghana.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS v3.4**, and **shadcn/ui** design system components.

---

## Tech Stack & Architecture

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS v3.4](https://tailwindcss.com/) with custom GBHPL HSL tokens (citrus orange `#f2673a`, charcoal `#17191d`, sand `#faf9f7`)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (`Button`, `Card`, `Badge`, `Dialog`, `Accordion`, `Input`, `Separator`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: `tailwindcss-animate`

---

## Features

1. **Modern Header & Bag Indicator**:
   - Sticky glassmorphic navbar with active anchors and mobile drawer.
   - Live shopping bag count with animated badge.

2. **Artisanal Hero Showcase**:
   - Interactive bottle size switcher (500ml @ GH₵105, 1000ml @ GH₵170) with dynamic SVG visual rendering.
   - Instant "Add to Bag" action and smooth scroll to product specs.

3. **Slide-Over Bag Drawer**:
   - Slide-out bag with Radix modal backdrop.
   - Quantity modification, item removal, and real-time Ghanaian Cedi (`GH₵`) subtotal calculation.
   - Persistent session storage across browser refreshes.

4. **Ghana Mobile Money Checkout Dialog**:
   - Seamless recipient details & phone number validation.
   - Dynamic delivery fee calculation by Ghana region (Central, Greater Accra, Ashanti, Western, Eastern, etc.).
   - Support for MTN MoMo, Telecel Cash, and AT Money network selection.
   - Simulated MoMo authorization with instant order reference (`GBH-XXXXXX`) generation and copy-to-clipboard.

5. **Delivery Tracking**:
   - Modal lookup for recent order references with live dispatch progress.

6. **Ingredient Transparency & FAQs**:
   - Ingredient breakdown for raw apples and living "mother" cultures.
   - Interactive shadcn accordion answering common questions.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```
