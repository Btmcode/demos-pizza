"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAP'ı client-side only register et
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * GSAP scroll reveal — elementler viewport'a girince animasyonlu görünür
 * Premium: scale + opacity + y transition
 *
 * Kullanım:
 * <div ref={ref} className="gsap-reveal">...</div>
 * useGsapReveal(ref);
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { delay?: number; y?: number; scale?: number; duration?: number }
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: options?.y ?? 40,
          scale: options?.scale ?? 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options?.duration ?? 0.8,
          delay: options?.delay ?? 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [options?.delay, options?.y, options?.scale, options?.duration]);

  return ref;
}

/**
 * GSAP stagger — birden fazla elementi sırayla animasyonla
 *
 * Kullanım:
 * <div ref={ref}>
 *   <div className="item">1</div>
 *   <div className="item">2</div>
 * </div>
 * useGsapStagger(ref, ".item");
 */
export function useGsapStagger<T extends HTMLElement = HTMLDivElement>(
  selector: string,
  options?: { delay?: number; stagger?: number; y?: number; duration?: number }
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector,
        {
          opacity: 0,
          y: options?.y ?? 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.6,
          delay: options?.delay ?? 0,
          stagger: options?.stagger ?? 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [selector, options?.delay, options?.stagger, options?.y, options?.duration]);

  return ref;
}

/**
 * GSAP parallax — element scroll ile hareket eder
 *
 * Kullanım:
 * <div ref={ref}>...</div>
 * useGsapParallax(ref, { speed: 0.3 });
 */
export function useGsapParallax<T extends HTMLElement = HTMLDivElement>(
  options?: { speed?: number; y?: number }
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: options?.y ?? -100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: options?.speed ?? 0.5,
        },
      });
    });

    return () => ctx.revert();
  }, [options?.speed, options?.y]);

  return ref;
}

/**
 * GSAP hover — element hover'da scale + shadow
 * Premium button/card hover effect
 *
 * Kullanım:
 * const ref = useGsapHover();
 * <button ref={ref}>...</button>
 */
export function useGsapHover<T extends HTMLElement = HTMLButtonElement>(
  options?: { scale?: number; duration?: number }
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const scale = options?.scale ?? 1.03;
    const duration = options?.duration ?? 0.3;

    const enter = () => gsap.to(el, { scale, duration, ease: "power2.out" });
    const leave = () => gsap.to(el, { scale: 1, duration, ease: "power2.out" });

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);

    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, [options?.scale, options?.duration]);

  return ref;
}

export { gsap, ScrollTrigger };
