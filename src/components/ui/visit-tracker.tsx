"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useOrders } from "@/context/orders-context";

/** Counts one storefront visit per opened tab (the manager area is not counted). */
export function VisitTracker() {
  const { track } = useOrders();
  const pathname = usePathname();
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current || pathname.startsWith("/manager")) return;
    counted.current = true;
    track("visit", pathname);
  }, [pathname, track]);

  return null;
}
