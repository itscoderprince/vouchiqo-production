"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({ children }) {
  const [lenisInstance, setLenisInstance] = useState(null);
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lenis = null;
    let rafId = null;
    let handleAnchorClick = null;
    let isCancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (isCancelled) return;

      document.documentElement.classList.add("lenis", "lenis-smooth");

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);

      handleAnchorClick = (e) => {
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
    });

    return () => {
      isCancelled = true;
      if (handleAnchorClick) {
        document.removeEventListener("click", handleAnchorClick);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenis) {
        lenis.destroy();
        document.documentElement.classList.remove("lenis", "lenis-smooth");
        window.lenis = null;
      }
    };
  }, []);

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
