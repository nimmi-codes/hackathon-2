import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], [role="option"], summary, label.day, .card-toggle';

/** Small green dot that tracks the pointer, with a ring that trails behind it. Fine-pointer devices only. */
export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, seen = false;

    const place = (el, px, py) => { el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`; };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) { seen = true; rx = x; ry = y; root.classList.add('cursor-ready'); }
      place(dot.current, x, y);
      ring.current.classList.toggle('hover', !!e.target.closest?.(INTERACTIVE));
    };
    const onDown = () => ring.current.classList.add('press');
    const onUp = () => ring.current.classList.remove('press');
    const onLeave = () => root.classList.remove('cursor-ready');
    const onEnter = () => seen && root.classList.add('cursor-ready');

    const tick = () => {
      // ease the ring toward the dot; with reduced motion it snaps (no trail)
      rx += (x - rx) * (reduce ? 1 : 0.16);
      ry += (y - ry) * (reduce ? 1 : 0.16);
      place(ring.current, rx, ry);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('has-custom-cursor', 'cursor-ready');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
