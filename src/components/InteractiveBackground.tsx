import { useEffect, useRef } from "react";

/**
 * Fixed, purely decorative background layer for the landing page.
 * - Soft drifting gradient orbs (brand blue / purple / teal)
 * - Faded grid that reacts to the cursor via a spotlight mask
 */
export default function InteractiveBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "30%" }}
    >
      {/* drifting brand orbs */}
      <div
        className="orb"
        style={{
          top: "-12%",
          left: "-8%",
          width: "42vw",
          height: "42vw",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--brand) 45%, transparent), transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div
        className="orb"
        style={{
          top: "18%",
          right: "-10%",
          width: "38vw",
          height: "38vw",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--brand-2) 45%, transparent), transparent 70%)",
          opacity: 0.45,
          animationDelay: "-7s",
        }}
      />
      <div
        className="orb"
        style={{
          bottom: "-14%",
          left: "22%",
          width: "36vw",
          height: "36vw",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent-teal) 40%, transparent), transparent 70%)",
          opacity: 0.4,
          animationDelay: "-14s",
        }}
      />

      {/* faded grid */}
      <div className="grid-fade absolute inset-0 opacity-70" />

      {/* cursor spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx) var(--my), color-mix(in oklab, var(--brand) 22%, transparent), transparent 65%)",
        }}
      />
    </div>
  );
}
