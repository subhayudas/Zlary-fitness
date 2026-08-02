"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  CONSENT_EVENT,
  readConsent,
  writeConsent,
  type ConsentState,
} from "./analytics";

/**
 * Subscribes to the visitor's analytics consent.
 *
 * `useSyncExternalStore` is the right primitive here: localStorage is an
 * external store, the server has no access to it, and the server snapshot is
 * always "unknown". That guarantees the server HTML and the first client render
 * agree — no hydration mismatch, and no tag can fire before the value is read.
 */

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  // Keeps multiple tabs in sync.
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/** Returns a primitive, so React's snapshot comparison stays stable. */
const getSnapshot = (): ConsentState => readConsent();
const getServerSnapshot = (): ConsentState => "unknown";

const getHydratedSnapshot = () => true;
const getHydratedServerSnapshot = () => false;

export function useConsent() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /**
   * False during SSR and the hydrating render, true afterwards. Lets the banner
   * avoid flashing in before the stored decision is known.
   */
  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const grant = useCallback(() => writeConsent("granted"), []);
  const deny = useCallback(() => writeConsent("denied"), []);

  return { consent, hydrated, grant, deny };
}
