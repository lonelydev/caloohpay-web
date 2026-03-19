import { useEffect, useRef } from 'react';

/**
 * Hook to reveal elements on scroll with fade-in and slide-up animation.
 * Respects `prefers-reduced-motion: reduce` for accessibility.
 * @template T - HTML element type
 * @returns Ref to attach to the element to animate
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Immediately reveal without animation for accessibility
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      return;
    }

    // Use IntersectionObserver for animation when motion is allowed
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
