"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Quiet entrance motion shared by every page: each `[data-motion]` element
 * fades and lifts a few pixels as it scrolls into view. Deliberately restrained
 * — short distance, low duration, no colour change (see DESIGN.md, "trust
 * through restraint").
 *
 * Content stays readable without JS: the initial hidden state only applies
 * while <html> carries the `js-motion` class, which a tiny inline script adds
 * before paint and drops again if this component never signals ready. Once GSAP
 * takes over it owns the visuals through inline styles, so the class is removed
 * — a client-side navigation to a page this effect never ran on can then never
 * inherit a hidden state nothing will animate.
 *
 * Only the innermost `[data-motion]` elements animate, so a page can mark both
 * a broad container and finer pieces without fading twice. Mark elements that
 * are present on first render only: content inside a <Suspense> boundary
 * hydrates in a later pass, and styling it earlier makes React report a
 * server/client mismatch.
 */
export function PageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const all = Array.from(
      document.querySelectorAll<HTMLElement>("[data-motion]")
    );
    // Animate only the innermost targets: an element that wraps other
    // `[data-motion]` elements would otherwise fade twice.
    const targets = all.filter((el) => !el.querySelector("[data-motion]"));
    // Tell the pre-paint bootstrap that motion is live, so its safety timer
    // leaves the `js-motion` class alone.
    root.setAttribute("data-motion-ready", "");
    if (targets.length === 0) {
      root.classList.remove("js-motion");
      return;
    }

    // Reduced motion leaves everything plainly visible. (The bootstrap never
    // adds `js-motion` in that case, so this is belt-and-braces.)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(targets, { opacity: 1, y: 0 });
      root.classList.remove("js-motion");
      return;
    }

    // Animate per section so siblings rise together rather than one long chain.
    const ctx = gsap.context(() => {
      const groups = new Map<Element, HTMLElement[]>();
      for (const el of targets) {
        const scope =
          el.closest("section") ?? el.closest("main") ?? document.body;
        const group = groups.get(scope) ?? [];
        group.push(el);
        groups.set(scope, group);
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

    // GSAP has now set the hidden from-state inline, so the CSS anti-flash
    // class is no longer needed.
    root.classList.remove("js-motion");

    return () => ctx.revert();
  }, []);

  return null;
}
