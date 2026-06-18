"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!els.length) {
      document.documentElement.classList.remove("js-reveal");
      return;
    }

    document.documentElement.classList.add("js-reveal");

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    // Reveal anything in viewport or within 400px below fold
    const immediateZone = window.innerHeight + 400;
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < immediateZone && rect.bottom >= 0) {
        el.classList.add("is-visible");
      } else {
        obs.observe(el);
      }
    });

    // Failsafe: reveal everything after 1.2s
    const timer = setTimeout(() => {
      els.forEach((el) => el.classList.add("is-visible"));
    }, 1200);

    return () => {
      obs.disconnect();
      clearTimeout(timer);
      // Clean up is-visible so next page starts fresh
      els.forEach((el) => el.classList.remove("is-visible"));
      document.documentElement.classList.remove("js-reveal");
    };
  }, [pathname]);

  return null;
}
