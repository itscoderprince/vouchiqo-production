"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Detects the user's city via browser geolocation + OpenStreetMap reverse geocoding.
 * Falls back gracefully if permission is denied or geolocation is unavailable.
 *
 * Returns:
 *  - city        string | null  — detected city name, null while pending or denied
 *  - status      "idle" | "detecting" | "ready" | "denied" | "unavailable"
 *  - detect()    function       — trigger detection manually
 *  - setCity()   function       — allow manual city override
 */
export function useLocation() {
  const [city, setCityState] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | detecting | ready | denied | unavailable

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Hydrate location from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vouchiqo_city");
      if (saved) {
        if (isMountedRef.current) {
          setCityState(saved);
          setStatus("ready");
        }
      }
    } catch (e) {
      console.error("Failed to read location from localStorage:", e);
    }
  }, []);

  const setCity = useCallback((newCity) => {
    if (!isMountedRef.current) return;
    setCityState(newCity);
    try {
      if (newCity) {
        localStorage.setItem("vouchiqo_city", newCity);
        setStatus("ready");
      } else {
        localStorage.removeItem("vouchiqo_city");
        setStatus("idle");
      }
    } catch (e) {
      console.error("Failed to write location to localStorage:", e);
    }
  }, []);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      if (isMountedRef.current) setStatus("unavailable");
      return;
    }

    if (isMountedRef.current) setStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `${NOMINATIM_URL}?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (!res.ok) throw new Error("Reverse geocode failed");

          const data = await res.json();
          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            null;

          if (isMountedRef.current) {
            setCity(detected);
            setStatus(detected ? "ready" : "unavailable");
          }
        } catch {
          if (isMountedRef.current) setStatus("unavailable");
        }
      },
      () => {
        if (isMountedRef.current) setStatus("denied");
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }, // cache position 5 min
    );
  }, [setCity]);

  // Auto-detect on mount (silent — no prompt until called)
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then(({ state }) => {
        // Only auto-detect if already granted — never auto-prompt
        if (state === "granted" && !localStorage.getItem("vouchiqo_city")) {
          detect();
        }
      })
      .catch(() => {}); // permissions API not available in all browsers
  }, [detect]);

  return { city, setCity, status, detect };
}
