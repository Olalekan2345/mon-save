"use client";

/**
 * MonSave motion system — the only place animation primitives live.
 * See docs/MOTION_SYSTEM.md. Every utility respects prefers-reduced-motion:
 * reduced mode renders final states instantly and disables loops.
 */
import { motion, useReducedMotion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export const spring = {
  soft: { type: "spring" as const, stiffness: 120, damping: 20 },
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
};

export function FadeRise({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const reduce = useReducedMotion();
  const Comp = as === "section" ? motion.section : as === "li" ? motion.li : motion.div;
  if (reduce) return as === "section" ? <section className={className}>{children}</section> : as === "li" ? <li className={className}>{children}</li> : <div className={className}>{children}</div>;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring.soft, delay }}
    >
      {children}
    </Comp>
  );
}

export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: spring.soft } }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...spring.soft, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Gentle vertical drift for hero decoration only. Disabled under reduced motion. */
export function FloatSlow({ children, className, amplitude = 6, duration = 6 }: { children: ReactNode; className?: string; amplitude?: number; duration?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Count-up for REAL values only — call with data that has already loaded.
 * Renders the final value immediately under reduced motion.
 */
export function AnimatedCounter({ value, className, format }: { value: number; className?: string; format?: (n: number) => string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const smoothed = useSpring(mv, { stiffness: 80, damping: 24 });

  useEffect(() => {
    if (reduce) return;
    if (inView) mv.set(value);
  }, [inView, value, mv, reduce]);

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = format ? format(value) : String(value);
      return;
    }
    const unsub = smoothed.on("change", (v) => {
      if (ref.current) {
        const n = Math.round(v * 100) / 100;
        ref.current.textContent = format ? format(n) : String(n);
      }
    });
    return unsub;
  }, [smoothed, format, reduce, value]);

  return (
    <span ref={ref} className={`num ${className ?? ""}`}>
      {format ? format(reduce ? value : 0) : String(reduce ? value : 0)}
    </span>
  );
}
