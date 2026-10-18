import { createHttpApi } from "./http";
import { localApi } from "./local";
import type { StoreApi } from "./types";

export type { LiveEvent, LiveEventType, StoreApi } from "./types";

/**
 * Set NEXT_PUBLIC_API_URL (see .env.example) to talk to a real backend.
 * Leave it empty and the site runs on the built-in in-browser store.
 */
const url = process.env.NEXT_PUBLIC_API_URL;

export const api: StoreApi = url ? createHttpApi(url) : localApi;
