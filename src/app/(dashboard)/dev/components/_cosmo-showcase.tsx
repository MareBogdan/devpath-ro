"use client";

import { useState } from "react";
import { CosmoMascot, type CosmoEmotion } from "@/components/mascot/cosmo-mascot";

const EMOTIONS: { id: CosmoEmotion; label: string; description: string }[] = [
  { id: "happy",       label: "Happy",       description: "Default — gentle smile, slow tail wag" },
  { id: "excited",     label: "Excited",     description: "Wide eyes, fast wag, body bounce, sparks" },
  { id: "thinking",    label: "Thinking",    description: "Half-closed eyes, antenna pulses gold" },
  { id: "encouraging", label: "Encouraging", description: "Soft eyes, badge pulses warmly" },
  { id: "celebrating", label: "Celebrating", description: "◠‿◠ squint, rainbow antenna, confetti" },
  { id: "sleeping",    label: "Sleeping",    description: "Closed eyes, droopy ears, floating Z's" },
  { id: "waving",      label: "Waving",      description: "One paw raised — friendly hello" },
  { id: "sad",         label: "Sad",         description: "Big puppy eyes, droopy ears, dim antenna" },
];

const SIZE_SAMPLES: { px: number; label: string; site: string }[] = [
  { px: 32, label: "32 px", site: "AI Coach typing" },
  { px: 56, label: "56 px", site: "Streak / level toast" },
  { px: 90, label: "90 px", site: "Lesson gate" },
  { px: 150, label: "150 px", site: "Celebration overlay" },
  { px: 200, label: "200 px", site: "Default" },
];

export function CosmoShowcase() {
  const [hero, setHero] = useState<CosmoEmotion>("happy");
  const [bg, setBg] = useState<"dark" | "light">("dark");

  return (
    <div className="space-y-8">
      {/* ── Hero: large interactive Cosmo ── */}
      <div
        className={
          "relative rounded-2xl border overflow-hidden transition-colors " +
          (bg === "dark"
            ? "bg-[#0F1429] border-white/10"
            : "bg-[#FFF8EC] border-amber-200")
        }
      >
        <div className="grid md:grid-cols-[1fr_300px] gap-6 p-6">
          {/* Cosmo */}
          <div className="flex items-center justify-center min-h-[380px] relative">
            <CosmoMascot
              emotion={hero}
              size={340}
              enableInteraction
              enableIdleAnimations
            />
            <p
              className={
                "absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-center " +
                (bg === "dark" ? "text-white/40" : "text-amber-900/50")
              }
            >
              Mișcă mouse-ul peste Cosmo — privirea îl urmărește.
              <br />
              Stai deasupra: dă din coadă mai tare.  Fii inactiv 10s: tilt curios.
            </p>
          </div>

          {/* Emotion picker */}
          <div className="space-y-3">
            <div>
              <h3 className={"text-sm font-semibold " + (bg === "dark" ? "text-white" : "text-amber-950")}>
                Emoții
              </h3>
              <p className={"text-xs " + (bg === "dark" ? "text-white/50" : "text-amber-900/60")}>
                Tranziții easing pe fiecare frame. Mouth path morphing via Framer Motion.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setHero(e.id)}
                  className={
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " +
                    (hero === e.id
                      ? "bg-aurora-primary-500 text-white border-aurora-primary-500 shadow-lg shadow-aurora-primary-500/30"
                      : bg === "dark"
                        ? "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                        : "bg-white text-amber-900 border-amber-200 hover:bg-amber-50")
                  }
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className={"text-xs leading-relaxed pt-2 border-t " + (bg === "dark" ? "text-white/60 border-white/10" : "text-amber-900/70 border-amber-200")}>
              {EMOTIONS.find((e) => e.id === hero)?.description}
            </div>

            <div className="pt-3">
              <h4 className={"text-xs font-semibold mb-2 " + (bg === "dark" ? "text-white/80" : "text-amber-950")}>
                Background
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setBg("dark")}
                  className={
                    "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors " +
                    (bg === "dark"
                      ? "bg-aurora-primary-500 text-white border-aurora-primary-500"
                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-50")
                  }
                >
                  Dark
                </button>
                <button
                  onClick={() => setBg("light")}
                  className={
                    "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors " +
                    (bg === "light"
                      ? "bg-aurora-primary-500 text-white border-aurora-primary-500"
                      : bg === "dark"
                        ? "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                        : "bg-white text-amber-900 border-amber-200")
                  }
                >
                  Light
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid: all 8 emotions side by side ── */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Toate cele 8 emoții</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMOTIONS.map((e) => (
            <div
              key={e.id}
              className="rounded-xl bg-card border border-border p-3 flex flex-col items-center"
            >
              <CosmoMascot
                emotion={e.id}
                size={160}
                enableIdleAnimations
                enableInteraction={false}
              />
              <div className="text-xs font-medium text-foreground mt-1">{e.label}</div>
              <div className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">
                {e.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Size sampler: how Cosmo reads at the actual integration sizes ── */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Cum arată Cosmo la dimensiunile reale</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Dimensiunile cu care va apărea Cosmo în diferite locuri din aplicație.
        </p>
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex flex-wrap items-end justify-around gap-4">
            {SIZE_SAMPLES.map((s) => (
              <div key={s.px} className="flex flex-col items-center gap-1.5">
                <CosmoMascot
                  emotion="happy"
                  size={s.px}
                  enableIdleAnimations
                />
                <div className="text-xs font-medium text-foreground">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.site}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
