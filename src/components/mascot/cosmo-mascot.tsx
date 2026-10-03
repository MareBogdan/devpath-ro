"use client";

/**
 * CosmoMascot — DevPath RO's official mascot. (Phase 5 — kawaii)
 *
 * Phase 4 was simpler but still not "aww" — the head was too small relative
 * to the body, eyes were too small and too high, the muzzle was barely
 * visible, the smile didn't read, and the tail was hidden. Phase 5 follows
 * proper chibi proportions and adds the kawaii signatures (visible muzzle
 * bump, big visible smile, soft outline, sparkles on the antenna).
 *
 * Reference proportions (per spec):
 *   • Head: ~45% of total character height
 *   • Body: ~35% (round bean, narrower than head)
 *   • Legs: ~15% (short stubby)
 *   • Ground shadow: ~5%
 *   • Eye width: 30-35% of head width
 *   • Eye gap: ~0.7 eye widths between inner edges
 *   • Eyes positioned in the lower 40% of the head (big empty forehead)
 *   • Ear length: hanging well below chin
 *
 * Architecture (unchanged):
 *   • SSR-safe React + SVG
 *   • Single rAF loop drives all continuous animation
 *   • Framer Motion only for mouth path morphing
 *   • Canvas particle overlay sibling
 *   • Subtle dark outline on major silhouettes (kawaii convention)
 */

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ─── Public types ─────────────────────────────────────────────────────────────

export type CosmoEmotion =
  | "happy"
  | "excited"
  | "thinking"
  | "encouraging"
  | "celebrating"
  | "sleeping"
  | "waving"
  | "sad";

interface CosmoMascotProps {
  emotion?: CosmoEmotion;
  size?: number;
  className?: string;
  enableIdleAnimations?: boolean;
  enableInteraction?: boolean;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const COLORS = {
  // Body/head fur — 2 stops only
  furTop: "#F5A623",
  furBot: "#E8930C",
  // Darker fur tone — used for back legs (depth/shadow)
  furDark: "#D4850A",
  // Ears — slightly darker than head
  earTop: "#D4850A",
  earBot: "#A86808",
  // Cream (muzzle + belly)
  creamTop: "#FDE68A",
  creamBot: "#F8C04C",
  // Belly patch — lighter cream for visibility on golden body
  bellyLight: "#FEF3C7",
  // Eyes
  eyeWhite: "#FFFFFF",
  irisDark: "#1F1611",       // very dark brown — almost black, warmest
  // Cheeks
  cheek: "#F9A8D4",
  // Nose / mouth
  noseDark: "#292524",
  mouth: "#1F1410",
  mouthOpen: "#7F1D1D",
  tongue: "#FB7185",
  // Paw toe bumps — slightly lighter golden
  pawToe: "#FFB940",
  // Tech accents
  badgeViolet: "#6C5CE7",
  badgeViolet2: "#A78BFA",
  antennaTeal: "#00CEC9",
  antennaThinking: "#FCD34D",
  antennaCelebrating: "#FF6B9D",
  // Ground shadow + soft outline
  shadow: "#0F172A",
  outline: "#92400E",        // warm-brown outline color (kawaii convention)
  outlineDeep: "#7C2D12",
} as const;

const OUTLINE_OPACITY = 0.35;
const OUTLINE_WIDTH = 1.5;

// ─── Mouth paths — same M-Q structure for clean morphing ─────────────────────

const MOUTH_LIP: Record<CosmoEmotion, string> = {
  happy:        "M -13 -1 Q 0 9 13 -1",
  sad:          "M -10 1.5 Q 0 -4 10 1.5",
  thinking:     "M -5 0 Q 0 1 5 0",
  encouraging:  "M -13 -1 Q 0 9 13 -1",
  waving:       "M -13 -1 Q 0 9 13 -1",
  sleeping:     "M -8 0 Q 0 4 8 0",
  excited:      "M -14 -2 Q 0 11 14 -2",
  celebrating:  "M -15 -3 Q 0 13 15 -3",
};

const MOUTH_OPEN: Record<CosmoEmotion, string> = {
  happy:        "M -13 -1 Q 0 9 13 -1 Q 0 -1 -13 -1 Z",
  sad:          "M -10 1.5 Q 0 -4 10 1.5 Q 0 -4 -10 1.5 Z",
  thinking:     "M -5 0 Q 0 1 5 0 Q 0 0 -5 0 Z",
  encouraging:  "M -13 -1 Q 0 9 13 -1 Q 0 -1 -13 -1 Z",
  waving:       "M -13 -1 Q 0 9 13 -1 Q 0 -1 -13 -1 Z",
  sleeping:     "M -8 0 Q 0 4 8 0 Q 0 0 -8 0 Z",
  excited:      "M -14 -2 Q 0 11 14 -2 Q 0 -3 -14 -2 Z",
  celebrating:  "M -15 -3 Q 0 13 15 -3 Q 0 -5 -15 -3 Z",
};

// ─── Per-emotion animation targets ────────────────────────────────────────────

interface EmotionTargets {
  headRotate: number;
  headBob: number;
  earLeftRotate: number;
  earRightRotate: number;
  eyeOpen: number;
  eyeSize: number;
  pupilX: number;
  pupilY: number;
  closedEyes: boolean;
  squintHappy: boolean;
  mouthOpenOpacity: number;
  bodyBounceAmp: number;
  bodyBounceFreq: number;
  tailRestPitch: number;
  tailWagSpeed: number;
  tailWagAmp: number;
  antennaColor: string;
  antennaPulseSpeed: number;
  badgePulseSpeed: number;
  rainbowAntenna: boolean;
  cheekBlushOpacity: number;
  particleType: "none" | "sparks" | "zzz" | "rainbow";
}

const EMOTIONS: Record<CosmoEmotion, EmotionTargets> = {
  happy: {
    headRotate: 0, headBob: 0,
    earLeftRotate: -6, earRightRotate: 6,
    eyeOpen: 1, eyeSize: 1, pupilX: 0, pupilY: 0,
    closedEyes: false, squintHappy: false,
    mouthOpenOpacity: 0,
    bodyBounceAmp: 0, bodyBounceFreq: 0,
    tailRestPitch: 35, tailWagSpeed: 1.4, tailWagAmp: 18,
    antennaColor: COLORS.antennaTeal,
    antennaPulseSpeed: 0.6, badgePulseSpeed: 0.5,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.4,
    particleType: "none",
  },
  excited: {
    headRotate: 0, headBob: 0,
    earLeftRotate: 8, earRightRotate: 14,
    eyeOpen: 1.05, eyeSize: 1.12, pupilX: 0, pupilY: 0.6,
    closedEyes: false, squintHappy: false,
    mouthOpenOpacity: 1,
    bodyBounceAmp: 2.5, bodyBounceFreq: 4,
    tailRestPitch: 50, tailWagSpeed: 5, tailWagAmp: 34,
    antennaColor: COLORS.antennaTeal,
    antennaPulseSpeed: 2.2, badgePulseSpeed: 1.6,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.6,
    particleType: "sparks",
  },
  thinking: {
    headRotate: -7, headBob: -1,
    earLeftRotate: 12, earRightRotate: -16,
    eyeOpen: 0.55, eyeSize: 0.95, pupilX: -2.2, pupilY: -2.5,
    closedEyes: false, squintHappy: false,
    mouthOpenOpacity: 0,
    bodyBounceAmp: 0, bodyBounceFreq: 0,
    tailRestPitch: 25, tailWagSpeed: 0, tailWagAmp: 0,
    antennaColor: COLORS.antennaThinking,
    antennaPulseSpeed: 3.2, badgePulseSpeed: 0.4,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.35,
    particleType: "none",
  },
  encouraging: {
    headRotate: 3, headBob: -1,
    earLeftRotate: -3, earRightRotate: 3,
    eyeOpen: 0.92, eyeSize: 1.05, pupilX: 0, pupilY: -0.5,
    closedEyes: false, squintHappy: false,
    mouthOpenOpacity: 0,
    bodyBounceAmp: 0, bodyBounceFreq: 0,
    tailRestPitch: 40, tailWagSpeed: 2.5, tailWagAmp: 24,
    antennaColor: COLORS.antennaTeal,
    antennaPulseSpeed: 1, badgePulseSpeed: 2,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.5,
    particleType: "none",
  },
  celebrating: {
    headRotate: 0, headBob: 0,
    earLeftRotate: 18, earRightRotate: 22,
    eyeOpen: 0.45, eyeSize: 1.15, pupilX: 0, pupilY: 0,
    closedEyes: false, squintHappy: true,
    mouthOpenOpacity: 1,
    bodyBounceAmp: 5, bodyBounceFreq: 5.5,
    tailRestPitch: 55, tailWagSpeed: 8, tailWagAmp: 42,
    antennaColor: COLORS.antennaCelebrating,
    antennaPulseSpeed: 4, badgePulseSpeed: 3,
    rainbowAntenna: true,
    cheekBlushOpacity: 0.7,
    particleType: "rainbow",
  },
  sleeping: {
    headRotate: -5, headBob: 1.5,
    earLeftRotate: -25, earRightRotate: -25,
    eyeOpen: 0.05, eyeSize: 1, pupilX: 0, pupilY: 0,
    closedEyes: true, squintHappy: false,
    mouthOpenOpacity: 0,
    bodyBounceAmp: 0.8, bodyBounceFreq: 0.5,
    tailRestPitch: -8, tailWagSpeed: 0, tailWagAmp: 0,
    antennaColor: COLORS.antennaTeal,
    antennaPulseSpeed: 0.25, badgePulseSpeed: 0.3,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.4,
    particleType: "zzz",
  },
  waving: {
    headRotate: 3, headBob: 0,
    earLeftRotate: 6, earRightRotate: -10,
    eyeOpen: 1, eyeSize: 1.05, pupilX: 0, pupilY: 0,
    closedEyes: false, squintHappy: false,
    mouthOpenOpacity: 0,
    bodyBounceAmp: 0, bodyBounceFreq: 0,
    tailRestPitch: 42, tailWagSpeed: 3.2, tailWagAmp: 26,
    antennaColor: COLORS.antennaTeal,
    antennaPulseSpeed: 1.3, badgePulseSpeed: 0.6,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.5,
    particleType: "none",
  },
  sad: {
    headRotate: -3, headBob: 1.5,
    earLeftRotate: -30, earRightRotate: -30,
    eyeOpen: 0.85, eyeSize: 1.18, pupilX: 0, pupilY: 1.8,
    closedEyes: false, squintHappy: false,
    mouthOpenOpacity: 0,
    bodyBounceAmp: 0, bodyBounceFreq: 0,
    tailRestPitch: -25, tailWagSpeed: 0, tailWagAmp: 0,
    antennaColor: COLORS.antennaTeal,
    antennaPulseSpeed: 0.2, badgePulseSpeed: 0.2,
    rainbowAntenna: false,
    cheekBlushOpacity: 0.3,
    particleType: "none",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hslHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h * 6;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─── Particle overlay (unchanged) ────────────────────────────────────────────

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  size: number; rotation: number; rotationSpeed: number;
  color: string; shape: "spark" | "zzz" | "confetti";
}

function ParticleOverlay({
  particleType,
  size,
}: {
  particleType: "sparks" | "zzz" | "rainbow";
  size: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * 1.15 * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 1.15}px`;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let lastTime = performance.now();
    let spawnAccumulator = 0;
    const vbScaleX = size / 200;
    const vbScaleY = (size * 1.15) / 230;

    function spawnParticle(): Particle | null {
      if (particleType === "sparks") {
        const angle = Math.random() * Math.PI * 2;
        const radius = 32 + Math.random() * 28;
        return {
          x: 100 + Math.cos(angle) * radius,
          y: 80 + Math.sin(angle) * radius,
          vx: Math.cos(angle) * (10 + Math.random() * 15),
          vy: Math.sin(angle) * (10 + Math.random() * 15) - 8,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.5,
          size: 2 + Math.random() * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 4,
          color: COLORS.antennaTeal,
          shape: "spark",
        };
      }
      if (particleType === "rainbow") {
        const isConfetti = Math.random() < 0.5;
        if (isConfetti) {
          return {
            x: 60 + Math.random() * 80,
            y: -10,
            vx: (Math.random() - 0.5) * 30,
            vy: 30 + Math.random() * 40,
            life: 0,
            maxLife: 2 + Math.random() * 0.8,
            size: 3 + Math.random() * 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 8,
            color: hslHex(Math.random(), 0.85, 0.6),
            shape: "confetti",
          };
        }
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 30;
        return {
          x: 100 + Math.cos(angle) * radius,
          y: 80 + Math.sin(angle) * radius,
          vx: Math.cos(angle) * (12 + Math.random() * 20),
          vy: Math.sin(angle) * (12 + Math.random() * 20) - 10,
          life: 0,
          maxLife: 0.9 + Math.random() * 0.5,
          size: 2.5 + Math.random() * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 6,
          color: hslHex(Math.random(), 0.85, 0.65),
          shape: "spark",
        };
      }
      // zzz
      return {
        x: 152 + (Math.random() - 0.5) * 8,
        y: 28 + (Math.random() - 0.5) * 4,
        vx: 6 + Math.random() * 4,
        vy: -15 - Math.random() * 6,
        life: 0,
        maxLife: 2.2,
        size: 5 + Math.random() * 2,
        rotation: -0.15,
        rotationSpeed: 0,
        color: "#93C5FD",
        shape: "zzz",
      };
    }

    function spawnRate(): number {
      switch (particleType) {
        case "sparks": return 6;
        case "rainbow": return 16;
        case "zzz": return 0.8;
      }
    }

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      spawnAccumulator += dt * spawnRate();
      while (spawnAccumulator >= 1 && particlesRef.current.length < 80) {
        const p = spawnParticle();
        if (p) particlesRef.current.push(p);
        spawnAccumulator -= 1;
      }

      const next: Particle[] = [];
      const gravity = particleType === "rainbow" ? 40 : 20;
      for (const p of particlesRef.current) {
        p.life += dt;
        if (p.life >= p.maxLife) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.shape !== "zzz") p.vy += gravity * dt;
        else p.vy *= 0.99;
        p.vx *= 0.985;
        p.rotation += p.rotationSpeed * dt;

        const tt = p.life / p.maxLife;
        const fade = tt < 0.7 ? 1 : 1 - (tt - 0.7) / 0.3;
        const screenX = p.x * vbScaleX;
        const screenY = p.y * vbScaleY;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = fade;

        if (p.shape === "spark") {
          const s = p.size * vbScaleX;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.3, -s * 0.3);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.3, s * 0.3);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.3, s * 0.3);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.3, -s * 0.3);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "confetti") {
          const w = p.size * 1.6 * vbScaleX;
          const h = p.size * 0.6 * vbScaleX;
          ctx.fillStyle = p.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
        } else if (p.shape === "zzz") {
          const s = p.size * vbScaleX;
          ctx.fillStyle = p.color;
          ctx.font = `bold ${s * 2}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Z", 0, 0);
        }

        ctx.restore();
        next.push(p);
      }
      particlesRef.current = next;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [particleType, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    />
  );
}

// ─── Reusable sparkle (4-point star) ─────────────────────────────────────────

const SPARKLE_POINTS = "0,-3 0.7,-0.7 3,0 0.7,0.7 0,3 -0.7,0.7 -3,0 -0.7,-0.7";

// ─── Main component ───────────────────────────────────────────────────────────

export function CosmoMascot({
  emotion = "happy",
  size = 200,
  className,
  enableIdleAnimations = true,
  enableInteraction = false,
}: CosmoMascotProps) {
  const reduced = useReducedMotion() ?? false;
  const idleEnabled = enableIdleAnimations && !reduced;

  const rawUid = useId();
  const uid = rawUid.replace(/[:]/g, "-");
  const ID = {
    fur: `cosmo-fur-${uid}`,
    ear: `cosmo-ear-${uid}`,
    cream: `cosmo-cream-${uid}`,
    belly: `cosmo-belly-${uid}`,
    badge: `cosmo-badge-${uid}`,
    antenna: `cosmo-antenna-${uid}`,
    shadow: `cosmo-shadow-${uid}`,
    drop: `cosmo-drop-${uid}`,
    shadowBlur: `cosmo-shadowblur-${uid}`,
  };

  // ─── Refs to mutate per-frame via the rAF loop ──────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const earLeftRef = useRef<SVGGElement>(null);
  const earRightRef = useRef<SVGGElement>(null);
  const eyeLeftRef = useRef<SVGGElement>(null);
  const eyeRightRef = useRef<SVGGElement>(null);
  const pupilLeftRef = useRef<SVGGElement>(null);
  const pupilRightRef = useRef<SVGGElement>(null);
  const closedEyeLeftRef = useRef<SVGPathElement>(null);
  const closedEyeRightRef = useRef<SVGPathElement>(null);
  const squintLeftRef = useRef<SVGPathElement>(null);
  const squintRightRef = useRef<SVGPathElement>(null);
  const tailRestRef = useRef<SVGGElement>(null);
  const tailWagRef = useRef<SVGGElement>(null);
  const bodyBounceRef = useRef<SVGGElement>(null);
  const bodyBreathRef = useRef<SVGGElement>(null);
  const cheekLeftRef = useRef<SVGEllipseElement>(null);
  const cheekRightRef = useRef<SVGEllipseElement>(null);
  const antennaLEDRef = useRef<SVGCircleElement>(null);
  const antennaHaloRef = useRef<SVGCircleElement>(null);
  const badgeRef = useRef<SVGCircleElement>(null);
  const badgeHaloRef = useRef<SVGCircleElement>(null);
  const tongueRef = useRef<SVGEllipseElement>(null);

  // ─── Eased "current" state ──────────────────────────────────────────────
  const currentRef = useRef<EmotionTargets>({ ...EMOTIONS[emotion] });

  // ─── Mouse-gaze state ───────────────────────────────────────────────────
  const gazeRef = useRef({ x: 0, y: 0 });
  const cursorCloseRef = useRef(false);
  const lastMoveRef = useRef(performance.now());
  const [curiousIdleTilt, setCuriousIdleTilt] = useState(0);

  // ─── Idle animation refs ────────────────────────────────────────────────
  const isBlinkingRef = useRef(false);
  const twitchSideRef = useRef<"left" | "right" | null>(null);
  const twitchStartRef = useRef(0);

  // ─── Mouse-move listener ───────────────────────────────────────────────
  useEffect(() => {
    if (!enableInteraction) return;
    const el = containerRef.current;
    if (!el) return;

    function handleMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const range = Math.max(rect.width, 220);
      gazeRef.current.x = Math.max(-1, Math.min(1, dx / range));
      gazeRef.current.y = Math.max(-1, Math.min(1, dy / range));
      cursorCloseRef.current = Math.hypot(dx, dy) < rect.width * 0.55;
      lastMoveRef.current = performance.now();
    }

    function handleLeave() {
      gazeRef.current.x = 0;
      gazeRef.current.y = 0;
      cursorCloseRef.current = false;
    }

    window.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [enableInteraction]);

  // ─── Curious-idle tilt ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enableInteraction) {
      setCuriousIdleTilt(0);
      return;
    }
    const id = setInterval(() => {
      const idleSec = (performance.now() - lastMoveRef.current) / 1000;
      setCuriousIdleTilt(idleSec > 10 ? 6 : 0);
    }, 600);
    return () => clearInterval(id);
  }, [enableInteraction]);

  // ─── Idle blink scheduler ───────────────────────────────────────────────
  useEffect(() => {
    if (!idleEnabled) {
      isBlinkingRef.current = false;
      return;
    }
    let scheduled: ReturnType<typeof setTimeout> | null = null;
    let blinkOff: ReturnType<typeof setTimeout> | null = null;
    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 3000;
      scheduled = setTimeout(() => {
        isBlinkingRef.current = true;
        blinkOff = setTimeout(() => {
          isBlinkingRef.current = false;
        }, 140);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (scheduled) clearTimeout(scheduled);
      if (blinkOff) clearTimeout(blinkOff);
      isBlinkingRef.current = false;
    };
  }, [idleEnabled]);

  // ─── Idle ear twitch scheduler ──────────────────────────────────────────
  useEffect(() => {
    if (!idleEnabled) {
      twitchSideRef.current = null;
      return;
    }
    let scheduled: ReturnType<typeof setTimeout> | null = null;
    let twitchOff: ReturnType<typeof setTimeout> | null = null;
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 4000;
      scheduled = setTimeout(() => {
        twitchSideRef.current = Math.random() < 0.5 ? "left" : "right";
        twitchStartRef.current = performance.now();
        twitchOff = setTimeout(() => {
          twitchSideRef.current = null;
        }, 240);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (scheduled) clearTimeout(scheduled);
      if (twitchOff) clearTimeout(twitchOff);
      twitchSideRef.current = null;
    };
  }, [idleEnabled]);

  // ─── Master rAF loop ────────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    const startTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const t = (now - startTime) / 1000;
      const target = EMOTIONS[emotion];
      const cur = currentRef.current;
      const easeFactor = reduced ? 1 : 0.12;

      // Ease numeric properties toward emotion targets
      cur.headRotate = lerp(cur.headRotate, target.headRotate, easeFactor);
      cur.headBob = lerp(cur.headBob, target.headBob, easeFactor);
      cur.earLeftRotate = lerp(cur.earLeftRotate, target.earLeftRotate, easeFactor);
      cur.earRightRotate = lerp(cur.earRightRotate, target.earRightRotate, easeFactor);
      cur.eyeOpen = lerp(cur.eyeOpen, target.eyeOpen, easeFactor);
      cur.eyeSize = lerp(cur.eyeSize, target.eyeSize, easeFactor);
      cur.pupilX = lerp(cur.pupilX, target.pupilX, easeFactor);
      cur.pupilY = lerp(cur.pupilY, target.pupilY, easeFactor);
      cur.bodyBounceAmp = lerp(cur.bodyBounceAmp, target.bodyBounceAmp, easeFactor);
      cur.bodyBounceFreq = lerp(cur.bodyBounceFreq, target.bodyBounceFreq, easeFactor);
      cur.tailRestPitch = lerp(cur.tailRestPitch, target.tailRestPitch, easeFactor);
      cur.tailWagSpeed = lerp(cur.tailWagSpeed, target.tailWagSpeed, easeFactor);
      cur.tailWagAmp = lerp(cur.tailWagAmp, target.tailWagAmp, easeFactor);
      cur.antennaPulseSpeed = lerp(cur.antennaPulseSpeed, target.antennaPulseSpeed, easeFactor);
      cur.badgePulseSpeed = lerp(cur.badgePulseSpeed, target.badgePulseSpeed, easeFactor);
      cur.cheekBlushOpacity = lerp(cur.cheekBlushOpacity, target.cheekBlushOpacity, easeFactor);
      cur.closedEyes = target.closedEyes;
      cur.squintHappy = target.squintHappy;
      cur.rainbowAntenna = target.rainbowAntenna;

      const idleHeadDrift = idleEnabled ? Math.sin(t * 0.42) * 0.04 : 0;

      // ─── Parallax ─────────────────────────────────────────────────────
      const gazeX = enableInteraction ? gazeRef.current.x : 0;
      const gazeY = enableInteraction ? gazeRef.current.y : 0;
      const bodyShiftX = gazeX * 1.0;
      const bodyShiftY = gazeY * 0.5;
      const headShiftX = gazeX * 2.0;
      const headShiftY = gazeY * 1.2;
      const earShiftX = gazeX * 1.5;
      const earShiftY = gazeY * 0.8;
      const earRotateAdd = gazeX * 1.5;
      const pupilShiftX = gazeX * 1.8;
      const pupilShiftY = gazeY * 1.0;
      const gazeYaw = gazeX * 4;

      // BODY BOUNCE — pre-computed so the head can sync with it (keeps the head/body junction solid)
      const bounceY =
        cur.bodyBounceAmp > 0.05 && cur.bodyBounceFreq > 0.05
          ? Math.sin(t * Math.PI * 2 * cur.bodyBounceFreq) * cur.bodyBounceAmp
          : 0;

      // HEAD (rotates around chin pivot at 100, 124) — bounces with body so the neck doesn't snap apart
      if (headRef.current) {
        const totalRotate = cur.headRotate + gazeYaw + curiousIdleTilt;
        const totalY = cur.headBob + idleHeadDrift + headShiftY + bounceY;
        headRef.current.setAttribute(
          "transform",
          `translate(${headShiftX.toFixed(2)} ${totalY.toFixed(2)}) rotate(${totalRotate.toFixed(2)} 100 124)`
        );
      }

      // EAR LEFT — pivot at (62, 60)
      if (earLeftRef.current) {
        let twitchAdd = 0;
        if (twitchSideRef.current === "left") {
          const tw = (now - twitchStartRef.current) / 240;
          twitchAdd = Math.sin(tw * Math.PI * 4) * 10 * Math.max(0, 1 - tw);
        }
        earLeftRef.current.setAttribute(
          "transform",
          `translate(${earShiftX.toFixed(2)} ${earShiftY.toFixed(2)}) rotate(${(cur.earLeftRotate + twitchAdd + earRotateAdd).toFixed(2)} 62 60)`
        );
      }
      if (earRightRef.current) {
        let twitchAdd = 0;
        if (twitchSideRef.current === "right") {
          const tw = (now - twitchStartRef.current) / 240;
          twitchAdd = Math.sin(tw * Math.PI * 4) * 10 * Math.max(0, 1 - tw);
        }
        earRightRef.current.setAttribute(
          "transform",
          `translate(${earShiftX.toFixed(2)} ${earShiftY.toFixed(2)}) rotate(${(cur.earRightRotate + twitchAdd + earRotateAdd).toFixed(2)} 138 60)`
        );
      }

      // EYES — scaleY with blink composition
      const blinkScale = isBlinkingRef.current ? 0.05 : 1;
      const finalEyeOpen = cur.closedEyes ? 0.05 : Math.max(0.05, cur.eyeOpen * blinkScale);
      const eyeSizeScale = cur.eyeSize;

      if (eyeLeftRef.current) {
        eyeLeftRef.current.setAttribute(
          "transform",
          `scale(${eyeSizeScale.toFixed(3)} ${finalEyeOpen.toFixed(3)})`
        );
      }
      if (eyeRightRef.current) {
        eyeRightRef.current.setAttribute(
          "transform",
          `scale(${eyeSizeScale.toFixed(3)} ${finalEyeOpen.toFixed(3)})`
        );
      }

      // PUPILS — emotion target + gaze parallax
      const pupilFinalX = cur.pupilX + pupilShiftX;
      const pupilFinalY = cur.pupilY + pupilShiftY;
      if (pupilLeftRef.current) {
        pupilLeftRef.current.setAttribute(
          "transform",
          `translate(${pupilFinalX.toFixed(2)} ${pupilFinalY.toFixed(2)})`
        );
      }
      if (pupilRightRef.current) {
        pupilRightRef.current.setAttribute(
          "transform",
          `translate(${pupilFinalX.toFixed(2)} ${pupilFinalY.toFixed(2)})`
        );
      }

      // CLOSED-EYE LINES (sleeping)
      const closedEyeOpacity = cur.closedEyes ? 1 : 0;
      const closedEyeOpacityEased = closedEyeLeftRef.current
        ? lerp(parseFloat(closedEyeLeftRef.current.getAttribute("data-opacity") || "0"), closedEyeOpacity, easeFactor * 1.5)
        : closedEyeOpacity;
      if (closedEyeLeftRef.current) {
        closedEyeLeftRef.current.setAttribute("opacity", closedEyeOpacityEased.toFixed(3));
        closedEyeLeftRef.current.setAttribute("data-opacity", closedEyeOpacityEased.toString());
      }
      if (closedEyeRightRef.current) {
        closedEyeRightRef.current.setAttribute("opacity", closedEyeOpacityEased.toFixed(3));
        closedEyeRightRef.current.setAttribute("data-opacity", closedEyeOpacityEased.toString());
      }

      // SQUINT-HAPPY LINES (celebrating)
      const squintTarget = cur.squintHappy ? 1 : 0;
      const squintEased = squintLeftRef.current
        ? lerp(parseFloat(squintLeftRef.current.getAttribute("data-opacity") || "0"), squintTarget, easeFactor * 1.5)
        : squintTarget;
      if (squintLeftRef.current) {
        squintLeftRef.current.setAttribute("opacity", squintEased.toFixed(3));
        squintLeftRef.current.setAttribute("data-opacity", squintEased.toString());
      }
      if (squintRightRef.current) {
        squintRightRef.current.setAttribute("opacity", squintEased.toFixed(3));
        squintRightRef.current.setAttribute("data-opacity", squintEased.toString());
      }

      // BODY BOUNCE + parallax (bounceY already computed above so head can sync)
      if (bodyBounceRef.current) {
        bodyBounceRef.current.setAttribute(
          "transform",
          `translate(${bodyShiftX.toFixed(2)} ${(bounceY + bodyShiftY).toFixed(2)})`
        );
      }

      // BODY BREATHING
      const breathScale =
        idleEnabled && cur.bodyBounceAmp < 1 ? 1 + Math.sin(t * 2) * 0.012 : 1;
      if (bodyBreathRef.current) {
        bodyBreathRef.current.setAttribute(
          "transform",
          `translate(100 180) scale(1 ${breathScale.toFixed(4)}) translate(-100 -180)`
        );
      }

      // TAIL REST + WAG
      if (tailRestRef.current) {
        tailRestRef.current.setAttribute(
          "transform",
          `rotate(${(-cur.tailRestPitch).toFixed(2)})`
        );
      }
      const wagBoost = cursorCloseRef.current ? 1.6 : 1;
      const wagSpeedFinal = cur.tailWagSpeed * wagBoost;
      const wagAmpFinal = cur.tailWagAmp * (cursorCloseRef.current ? 1.3 : 1);
      const wagAngle =
        wagSpeedFinal > 0.05
          ? Math.sin(t * Math.PI * 2 * wagSpeedFinal) * wagAmpFinal
          : 0;
      if (tailWagRef.current) {
        tailWagRef.current.setAttribute("transform", `rotate(${wagAngle.toFixed(2)})`);
      }

      // ANTENNA LED — color (rainbow override) + pulse
      if (antennaLEDRef.current && antennaHaloRef.current) {
        let antennaCol = target.antennaColor;
        if (cur.rainbowAntenna) {
          antennaCol = hslHex((t * 0.5) % 1, 0.85, 0.6);
        }
        const pulse =
          0.55 +
          0.45 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * cur.antennaPulseSpeed));
        antennaLEDRef.current.setAttribute("fill", antennaCol);
        antennaHaloRef.current.setAttribute("fill", antennaCol);
        antennaHaloRef.current.setAttribute("opacity", (pulse * 0.5).toFixed(3));
        antennaLEDRef.current.style.filter = `drop-shadow(0 0 ${(3 + pulse * 5).toFixed(1)}px ${antennaCol})`;
      }

      // CHEST BADGE — subtler pulsing halo (badge is small, glow is an accent)
      const badgePulse =
        0.5 + 0.5 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * cur.badgePulseSpeed));
      if (badgeHaloRef.current) {
        badgeHaloRef.current.setAttribute("opacity", (badgePulse * 0.3).toFixed(3));
      }
      if (badgeRef.current) {
        badgeRef.current.style.filter = `drop-shadow(0 0 ${(1.2 + badgePulse * 2.5).toFixed(1)}px ${COLORS.badgeViolet})`;
      }

      // CHEEK BLUSH opacity
      if (cheekLeftRef.current) cheekLeftRef.current.setAttribute("opacity", cur.cheekBlushOpacity.toFixed(3));
      if (cheekRightRef.current) cheekRightRef.current.setAttribute("opacity", cur.cheekBlushOpacity.toFixed(3));

      // TONGUE
      if (tongueRef.current) {
        tongueRef.current.setAttribute("opacity", target.mouthOpenOpacity > 0.5 ? "1" : "0");
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotion, idleEnabled, enableInteraction, reduced, curiousIdleTilt]);

  const target = EMOTIONS[emotion];
  const transitionMouth = reduced
    ? { duration: 0 }
    : { duration: 0.4, ease: "easeInOut" as const };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size * 1.15,
        position: "relative",
        pointerEvents: enableInteraction ? "auto" : "none",
      }}
      aria-label={`Cosmo mascot: ${emotion}`}
      role="img"
    >
      <svg
        viewBox="0 0 200 230"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          {/* Body/head fur — 2 stops */}
          <linearGradient id={ID.fur} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={COLORS.furTop} />
            <stop offset="100%" stopColor={COLORS.furBot} />
          </linearGradient>

          {/* Ear — 2 stops, slightly darker */}
          <linearGradient id={ID.ear} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={COLORS.earTop} />
            <stop offset="100%" stopColor={COLORS.earBot} />
          </linearGradient>

          {/* Cream (muzzle) — 2 stops */}
          <linearGradient id={ID.cream} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={COLORS.creamTop} />
            <stop offset="100%" stopColor={COLORS.creamBot} />
          </linearGradient>

          {/* Belly patch — soft radial fade so edges blend into golden body */}
          <radialGradient id={ID.belly} cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stopColor={COLORS.bellyLight} stopOpacity="0.95" />
            <stop offset="65%"  stopColor={COLORS.bellyLight} stopOpacity="0.8" />
            <stop offset="100%" stopColor={COLORS.bellyLight} stopOpacity="0" />
          </radialGradient>

          {/* Chest badge — simple radial */}
          <radialGradient id={ID.badge} cx="40%" cy="35%" r="65%">
            <stop offset="0%"  stopColor={COLORS.badgeViolet2} />
            <stop offset="100%" stopColor={COLORS.badgeViolet} />
          </radialGradient>

          {/* Antenna LED — bright center radial */}
          <radialGradient id={ID.antenna} cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="50%"  stopColor={COLORS.antennaTeal} />
            <stop offset="100%" stopColor={COLORS.antennaTeal} stopOpacity="0.85" />
          </radialGradient>

          {/* Ground shadow */}
          <radialGradient id={ID.shadow} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={COLORS.shadow} stopOpacity="0.45" />
            <stop offset="100%" stopColor={COLORS.shadow} stopOpacity="0" />
          </radialGradient>

          {/* Subtle drop shadow filter */}
          <filter id={ID.drop} x="-20%" y="-10%" width="140%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
            <feOffset dx="0" dy="3" result="offsetBlur" />
            <feFlood floodColor="#0F172A" floodOpacity="0.18" />
            <feComposite in2="offsetBlur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Ground shadow soft blur — applied to the contact ellipse only */}
          <filter id={ID.shadowBlur} x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* ─── Ground shadow — outside the drop-shadow group so it stays put on the floor ─── */}
        <ellipse
          cx="100"
          cy="229"
          rx="36"
          ry="4"
          fill="#000000"
          opacity="0.14"
          filter={`url(#${ID.shadowBlur})`}
        />

        {/* ─── Mascot body ─── */}
        <g filter={`url(#${ID.drop})`}>
          {/* TAIL — fluffy golden retriever plume held up-right.  Curves up from back of body. */}
          <g transform="translate(132 165)">
            <g ref={tailRestRef} style={{ transformOrigin: "0 0" }}>
              <g ref={tailWagRef} style={{ transformOrigin: "0 0" }}>
                {/* Main plume — wide at base, tapering to a soft rounded tip up-right */}
                <path
                  d="M -6 4 Q -8 -8 0 -18 Q 8 -30 22 -38 Q 36 -36 30 -22 Q 22 -8 14 0 Q 6 6 -6 4 Z"
                  fill={`url(#${ID.fur})`}
                  stroke={COLORS.outline}
                  strokeWidth={OUTLINE_WIDTH}
                  strokeOpacity={OUTLINE_OPACITY}
                  strokeLinejoin="round"
                />
                {/* 2 lighter streaks suggesting fluffiness layers */}
                <path
                  d="M 0 -4 Q 10 -18 22 -28"
                  stroke={COLORS.creamBot}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d="M 6 -8 Q 16 -24 26 -32"
                  stroke={COLORS.creamBot}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.4"
                />
                {/* Tip fluff highlight */}
                <circle cx="26" cy="-32" r="5" fill={COLORS.creamTop} opacity="0.65" />
              </g>
            </g>
          </g>

          {/* BACK LEGS — thicker now for visual stability, peek further down */}
          <g>
            <ellipse cx="70" cy="204" rx="10" ry="16" fill={COLORS.furDark} stroke={COLORS.outline} strokeWidth={OUTLINE_WIDTH} strokeOpacity={OUTLINE_OPACITY} />
            <ellipse cx="130" cy="204" rx="10" ry="16" fill={COLORS.furDark} stroke={COLORS.outline} strokeWidth={OUTLINE_WIDTH} strokeOpacity={OUTLINE_OPACITY} />
          </g>

          {/* BODY (with bounce + breathing + parallax) — now includes integrated neck/chest that bridges into the head silhouette */}
          <g ref={bodyBounceRef}>
            <g ref={bodyBreathRef}>
              <path
                d="M 76 122 Q 64 132 80 140 C 64 148 60 175 70 192 C 82 204 118 204 130 192 C 140 175 136 148 120 140 Q 136 132 124 122 Q 100 116 76 122 Z"
                fill={`url(#${ID.fur})`}
                stroke={COLORS.outline}
                strokeWidth={OUTLINE_WIDTH}
                strokeOpacity={OUTLINE_OPACITY}
                strokeLinejoin="round"
              />

              {/* Belly + chest cream — extended upward to cover chest area, masking the head/body junction softly */}
              <ellipse cx="100" cy="170" rx="22" ry="28" fill={`url(#${ID.belly})`} />

              {/* CHEST BADGE — chest area, just above the belly center */}
              <g transform="translate(100 152)">
                <circle ref={badgeHaloRef} r="6" fill={COLORS.badgeViolet} opacity="0.2" />
                <circle ref={badgeRef} r="3" fill={`url(#${ID.badge})`} />
                <circle r="1.3" fill="#FFFFFF" opacity="0.7" />
              </g>
            </g>
          </g>

          {/* FRONT LEGS — articulated paths: subtle shoulder bulge → narrower trunk → wider rounded paw + toe bumps + paw pad */}
          {/* Left front leg */}
          <g>
            <path
              d="M 76 188 L 88 188 C 92 191 92 198 91 204 L 91 215 C 93 220 93 226 86 226 C 80 228 80 228 78 226 C 71 226 71 220 73 215 L 73 204 C 72 198 72 191 76 188 Z"
              fill={`url(#${ID.fur})`}
              stroke={COLORS.outline}
              strokeWidth={OUTLINE_WIDTH}
              strokeOpacity={OUTLINE_OPACITY}
              strokeLinejoin="round"
            />
            {/* Subtle paw pad — darker oval inside the paw, suggests foot pad */}
            <ellipse cx="82" cy="223" rx="4" ry="1.7" fill={COLORS.earBot} opacity="0.42" />
            {/* 3 toe bumps protruding from paw bottom */}
            <circle cx="76" cy="226" r="4" fill={COLORS.pawToe} />
            <circle cx="82" cy="228" r="4" fill={COLORS.pawToe} />
            <circle cx="88" cy="226" r="4" fill={COLORS.pawToe} />
          </g>
          {/* Right front leg — planted next to the left one (no waving limb: a raised/low arm reads as a third leg) */}
          <g>
            <path
              d="M 112 188 L 124 188 C 128 191 128 198 127 204 L 127 215 C 129 220 129 226 122 226 C 116 228 116 228 114 226 C 107 226 107 220 109 215 L 109 204 C 108 198 108 191 112 188 Z"
              fill={`url(#${ID.fur})`}
              stroke={COLORS.outline}
              strokeWidth={OUTLINE_WIDTH}
              strokeOpacity={OUTLINE_OPACITY}
              strokeLinejoin="round"
            />
            <ellipse cx="118" cy="223" rx="4" ry="1.7" fill={COLORS.earBot} opacity="0.42" />
            <circle cx="112" cy="226" r="4" fill={COLORS.pawToe} />
            <circle cx="118" cy="228" r="4" fill={COLORS.pawToe} />
            <circle cx="124" cy="226" r="4" fill={COLORS.pawToe} />
          </g>

          {/* HEAD GROUP — rotates around chin pivot (100, 124) */}
          <g ref={headRef}>
            {/* HEAD — golden retriever oval, slightly wider than tall (~1.15:1) */}
            <ellipse cx="100" cy="82" rx="46" ry="40" fill={`url(#${ID.fur})`} stroke={COLORS.outline} strokeWidth={OUTLINE_WIDTH} strokeOpacity={OUTLINE_OPACITY} />

            {/* LEFT EAR — long teardrop hanging well below chin */}
            <g ref={earLeftRef}>
              <path
                d="M 65 60 C 48 64 42 90 47 118 C 52 132 70 134 73 118 C 78 100 80 75 72 62 C 70 56 67 56 65 60 Z"
                fill={`url(#${ID.ear})`}
                stroke={COLORS.outline}
                strokeWidth={OUTLINE_WIDTH}
                strokeOpacity={OUTLINE_OPACITY}
                strokeLinejoin="round"
              />
            </g>

            {/* RIGHT EAR (with antenna emerging from middle) */}
            <g ref={earRightRef}>
              <path
                d="M 135 60 C 152 64 158 90 153 118 C 148 132 130 134 127 118 C 122 100 120 75 128 62 C 130 56 133 56 135 60 Z"
                fill={`url(#${ID.ear})`}
                stroke={COLORS.outline}
                strokeWidth={OUTLINE_WIDTH}
                strokeOpacity={OUTLINE_OPACITY}
                strokeLinejoin="round"
              />

              {/* Antenna — gently curved wire from MIDDLE of ear, lighter gray for dark-bg visibility */}
              <path
                d="M 148 88 Q 156 58 152 28"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Sparkles around the LED — kawaii detail */}
              <polygon points={SPARKLE_POINTS} fill="#FFFFFF" opacity="0.85" transform="translate(140 18) scale(0.6)" />
              <polygon points={SPARKLE_POINTS} fill="#FFFFFF" opacity="0.7" transform="translate(164 32) scale(0.5)" />
              <polygon points={SPARKLE_POINTS} fill="#FFFFFF" opacity="0.6" transform="translate(158 12) scale(0.4)" />
              {/* Antenna LED halo (animated by rAF) */}
              <circle ref={antennaHaloRef} cx="152" cy="28" r="9" fill={COLORS.antennaTeal} opacity="0.4" />
              {/* Antenna LED bulb — bigger than Phase 4 */}
              <circle ref={antennaLEDRef} cx="152" cy="28" r="4.5" fill={`url(#${ID.antenna})`} />
              {/* LED catchlight */}
              <circle cx="150.7" cy="26.6" r="1.4" fill="#FFFFFF" />
            </g>

            {/* MUZZLE — bigger and pushed forward, like a real dog snout */}
            <ellipse cx="100" cy="130" rx="23" ry="18" fill={`url(#${ID.cream})`} stroke={COLORS.outline} strokeWidth={OUTLINE_WIDTH * 1.15} strokeOpacity={OUTLINE_OPACITY * 1.35} strokeLinejoin="round" />
            {/* Subtle shadow arc where muzzle meets head — defines the 3D protrusion */}
            <path
              d="M 80 116 Q 100 110 120 116"
              stroke={COLORS.outlineDeep}
              strokeWidth="1.1"
              strokeOpacity="0.22"
              strokeLinecap="round"
              fill="none"
            />

            {/* CHEEKS — moved DOWN onto the muzzle area / lower jaw */}
            <ellipse ref={cheekLeftRef} cx="74" cy="124" rx="5" ry="4" fill={COLORS.cheek} opacity="0.4" />
            <ellipse ref={cheekRightRef} cx="126" cy="124" rx="5" ry="4" fill={COLORS.cheek} opacity="0.4" />

            {/* LEFT EYE — big, low on face, simple 3-shape design */}
            <g transform="translate(78 98)">
              <g ref={eyeLeftRef}>
                {/* Sclera — slightly oval, ~32% of head width */}
                <ellipse rx="13" ry="12" fill={COLORS.eyeWhite} stroke={COLORS.outline} strokeWidth="1.2" strokeOpacity="0.25" />
                {/* Iris/pupil combined — large, very dark brown (almost black) */}
                <g ref={pupilLeftRef}>
                  <circle r="10" fill={COLORS.irisDark} />
                  {/* ONE catchlight at top-right */}
                  <circle cx="3.5" cy="-3.5" r="2.3" fill="#FFFFFF" />
                </g>
              </g>
              {/* Closed-eye line (sleeping ◡) */}
              <path
                ref={closedEyeLeftRef}
                d="M -11 0 Q 0 6 11 0"
                stroke={COLORS.irisDark}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
              {/* Squint-happy line (celebrating ◠) */}
              <path
                ref={squintLeftRef}
                d="M -11 1.5 Q 0 -6 11 1.5"
                stroke={COLORS.irisDark}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
            </g>

            {/* RIGHT EYE — mirror */}
            <g transform="translate(122 98)">
              <g ref={eyeRightRef}>
                <ellipse rx="13" ry="12" fill={COLORS.eyeWhite} stroke={COLORS.outline} strokeWidth="1.2" strokeOpacity="0.25" />
                <g ref={pupilRightRef}>
                  <circle r="10" fill={COLORS.irisDark} />
                  <circle cx="3.5" cy="-3.5" r="2.3" fill="#FFFFFF" />
                </g>
              </g>
              <path
                ref={closedEyeRightRef}
                d="M -11 0 Q 0 6 11 0"
                stroke={COLORS.irisDark}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
              <path
                ref={squintRightRef}
                d="M -11 1.5 Q 0 -6 11 1.5"
                stroke={COLORS.irisDark}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
            </g>

            {/* NOSE — sits at top-front of the new bigger muzzle bump */}
            <ellipse cx="100" cy="121" rx="5.7" ry="4.2" fill={COLORS.noseDark} />
            <circle cx="98" cy="119" r="1.5" fill="#FFFFFF" opacity="0.9" />

            {/* MOUTH — bold smile in the lower half of the bigger muzzle */}
            <g transform="translate(100 138)">
              {/* Open-mouth fill (only visible for excited/celebrating) */}
              <motion.path
                initial={false}
                animate={{
                  d: MOUTH_OPEN[emotion],
                  opacity: target.mouthOpenOpacity,
                }}
                transition={transitionMouth}
                fill={COLORS.mouthOpen}
              />
              {/* Tongue (visible when mouth open) */}
              <ellipse
                ref={tongueRef}
                cx="0"
                cy="3"
                rx="4"
                ry="1.8"
                fill={COLORS.tongue}
                opacity="0"
              />
              {/* Lip line — bold, clearly readable smile (3px stroke) */}
              <motion.path
                initial={false}
                animate={{ d: MOUTH_LIP[emotion] }}
                transition={transitionMouth}
                stroke={COLORS.mouth}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </g>
        </g>
      </svg>

      {/* Particle overlay */}
      {target.particleType !== "none" && !reduced && (
        <ParticleOverlay particleType={target.particleType} size={size} />
      )}
    </div>
  );
}

export default CosmoMascot;
