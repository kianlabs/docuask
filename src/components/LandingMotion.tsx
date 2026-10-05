"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Quiet entrance motion for the marketing page: each `[data-motion]` element
 * fades and lifts a few pixels as it scrolls into view. Deliberately restrained
 * — short distance, low duration, no colour change (see DESIGN.md, "trust
 * through restraint").
 *
 * Content stays readable without JS: the initial hidden state only applies
 * while <html> carries the `js-motion` class, which a tiny inline script adds
 * before paint and drops again if this component never signals ready.
 * Reduced-motion users get everything revealed at once.
 */
export function LandingMotion() {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-motion]")
    );
    if (targets.length === 0) return;

    // Tell the pre-paint bootstrap that motion is live, so its safety timer
    // leaves the `js-motion` class in place.
    document.documentElement.setAttribute("data-motion-ready", "");

    // Reduced motion (or a failed animation) leaves everything plainly visible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    // Animate per section so siblings rise together rather than one long chain.
    const ctx = gsap.context(() => {
      const groups = new Map<Element, HTMLElement[]>();
      for (const el of targets) {
        const section = el.closest("section") ?? document.body;
        const group = groups.get(section) ?? [];
        group.push(el);
        groups.set(section, group);
      }

      for (const group of groups.values()) {
        gsap.fromTo(
          group,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: group[0], start: "top 88%", once: true },
          }
        );
      }
    }, document.body);

    return () => ctx.revert();
  }, []);

  return null;
}
