"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Memberi animasi halus pada elemen ber-atribut data-reveal.
 * Kelas awal dipasang dari JS supaya konten tetap tampil tanpa JavaScript.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    for (const element of elements) {
      element.classList.add("gd-reveal-init");
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
