"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import {
  LANGUAGE_EVENT,
  readLanguagePreference,
  refreshLanguageCookie,
  writeLanguagePreference,
} from "./language-preference";

/**
 * Subscribes to the visitor's stored language.
 *
 * Same shape, and the same reasoning, as `use-consent.ts`: the browser stores
 * are external to React, the server cannot see them, and the server snapshot is
 * always "not chosen yet". That guarantees the server HTML and the first client
 * render agree, so nothing can flash in before the stored answer is known.
 */

function subscribe(onStoreChange: () => void) {
  window.addEventListener(LANGUAGE_EVENT, onStoreChange);
  // Keeps other tabs in sync when the choice is made in one of them.
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(LANGUAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/** Returns a primitive, so React's snapshot comparison stays stable. */
const getSnapshot = (): Locale | null => readLanguagePreference();
const getServerSnapshot = (): Locale | null => null;

const getHydratedSnapshot = () => true;
const getHydratedServerSnapshot = () => false;

export function useLanguagePreference() {
  const preference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /**
   * False during SSR and the hydrating render, true afterwards. Lets a caller
   * tell "no choice made" apart from "the choice has not been read yet".
   */
  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  // Keeps the cookie alive for another year on every visit, so the server-side
  // redirect in proxy.ts keeps working for as long as the visitor keeps coming
  // back. Harmless when nothing is stored.
  useEffect(refreshLanguageCookie, []);

  const choose = useCallback(
    (locale: Locale) => writeLanguagePreference(locale),
    [],
  );

  return { preference, hydrated, choose };
}
