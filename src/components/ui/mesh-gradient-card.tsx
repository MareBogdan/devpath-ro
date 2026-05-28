"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface MeshGradientCardProps {
  colors?: [string, string, string] | [string, string, string, string];
  children: React.ReactNode;
  className?: string;
  intensity?: number;   // 0–1, opacity of the gradient overlay, default 0.12
  interactive?: boolean; // mouse-tilt 3D + holographic, default true
  onClick?: () => void;
}

// Deterministic gradient from a string (e.g. course slug)
export function slugToGradientColors(slug: string): [string, string, string] {
  const PRESETS: [string, string, string][] = [
    ["#6C5CE7", "#A29BFE", "#00CEC9"],
    ["#3B82F6", "#8B5CF6", "#06B6D4"],
    ["#10B981", "#059669", "#6C5CE7"],
    ["#F59E0B", "#EF4444", "#EC4899"],
    ["#EF4444", "#7C3AED", "#6C5CE7"],
    ["#0EA5E9", "#8B5CF6", "#EC4899"],
    ["#F59E0B", "#10B981", "#3B82F6"],
    ["#6C5CE7", "#FDCB6E", "#FF6B6B"],
  ];
  const hash = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PRESETS[hash % PRESETS.length];
}

export function MeshGradientCard({
  colors,
  children,
  className,
  intensity = 0.12,
  interactive = true,
  onClick,
}: MeshGradientCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // For holographic shine
  const [shineVisible, setShineVisible] = useState(false);
  const shineX = useMotionValue(-1);
  const shineY = useMotionValue(0);
  const [isEdge, setIsEdge] = useState(false);

  const springX = useSpring(x, { stiffness: 200, damping: 30 });
  const springY = useSpring(y, { stiffness: 200, damping: 30 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  // Holographic shine: translateX of the shine strip
  const shineSpringX = useSpring(shineX, { stiffness: 180, damping: 25 });
  const shineTranslate = useTransform(shineSpringX, [-1, 1], ["-80%", "160%"]);

  const resolvedColors = colors ?? ["#6C5CE7", "#A29BFE", "#00CEC9"];
  const [c0, c1, c2, c3] = resolvedColors;

  const meshBg = c3
    ? `radial-gradient(ellipse at 0% 0%, ${c0} 0%, transparent 60%),
       radial-gradient(ellipse at 100% 0%, ${c1} 0%, transparent 60%),
       radial-gradient(ellipse at 100% 100%, ${c2} 0%, transparent 60%),
       radial-gradient(ellipse at 0% 100%, ${c3} 0%, transparent 60%)`
    : `radial-gradient(ellipse at 0% 0%, ${c0} 0%, transparent 65%),
       radial-gradient(ellipse at 100% 0%, ${c1} 0%, transparent 65%),
       radial-gradient(ellipse at 50% 100%, ${c2} 0%, transparent 65%)`;

  // Edge glow color from primary gradient color
  const edgeGlowColor = c0;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;   // 0–1
    const ny = (e.clientY - rect.top) / rect.height;   // 0–1

    x.set(nx - 0.5);
    y.set(ny - 0.5);

    // Shine strip position: map 0–1 to -1–1
    shineX.set(nx * 2 - 1);
    shineY.set(ny * 2 - 1);

    // Near edge detection (within 18% of any edge)
    const nearEdge = nx < 0.18 || nx > 0.82 || ny < 0.18 || ny > 0.82;
    setIsEdge(nearEdge);
  }

  function handleMouseEnter() {
    if (!interactive) return;
    setShineVisible(true);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    shineX.set(2); // Slide off to the right
    setIsEdge(false);
    // Delay hiding so the slide-off animation completes
    setTimeout(() => setShineVisible(false), 350);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={
        interactive
          ? { rotateX, rotateY, transformStyle: "preserve-3d" }
          : undefined
      }
      whileHover={interactive ? { scale: 1.015 } : { scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        "bg-card dark:bg-[var(--aurora-bg-card)]",
        // Light mode shadow
        "shadow-[0_1px_3px_rgba(108,92,231,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
        "hover:shadow-[0_8px_24px_rgba(108,92,231,0.14),0_4px_8px_rgba(0,0,0,0.06)]",
        "transition-shadow duration-300",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: meshBg, opacity: intensity }}
        aria-hidden
      />

      {/* Edge glow border — appears on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          boxShadow: `inset 0 0 0 1px ${edgeGlowColor}80`,
        }}
        aria-hidden
      />

      {/* Holographic shine band */}
      {shineVisible && interactive && (
        <motion.div
          className="absolute inset-y-0 pointer-events-none"
          style={{
            width: "38%",
            translateX: shineTranslate,
            background:
              "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            zIndex: 5,
          }}
          aria-hidden
        />
      )}

      {/* Rainbow refraction at extreme angles — only visible near edges */}
      {shineVisible && interactive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isEdge ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            background: `linear-gradient(
              ${shineY.get() < 0 ? "to bottom" : "to top"},
              rgba(255,0,150,0.04) 0%,
              rgba(0,200,255,0.04) 33%,
              rgba(255,220,0,0.04) 66%,
              transparent 100%
            )`,
            zIndex: 4,
          }}
          aria-hidden
        />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
