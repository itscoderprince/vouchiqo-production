"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

const LenisContext = createContext(null);

/**
 * useLenis
 * Custom hook to access the global Lenis instance anywhere in the app.
 * Usage:
 *   const lenis = useLenis();
 *   lenis?.scrollTo('#my-section', { offset: -80 });
 */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * SmoothScrollProvider
 *
 * Provides buttery smooth 60fps/120fps hardware-accelerated inertia scrolling
 * across the entire application.
 *
 * Features:
 * - Auto-initialization on all pages
 * - Smooth anchor hash navigation (`#section`)
 * - Global window.lenis access
 * - Auto route change scroll-to-top reset
 * - Touch & mouse wheel optimization
 */
export default function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply lenis root class to html
    document.documentElement.classList.add("lenis", "lenis-smooth");

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easeOut physics
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.1,
      infinite: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Global listener for smooth anchor link scrolling
    const handleAnchorClick = (e) => {
      const target = e.target.closest("a[href*='#']");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href === "#") return;

      if (href.startsWith("#")) {
        const elem = document.querySelector(href);
        if (elem) {
          e.preventDefault();
          lenis.scrollTo(elem, { offset: -90, duration: 1.2 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      window.lenis = null;
    };
  }, []);

  // Scroll to top smoothly on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
    }
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
