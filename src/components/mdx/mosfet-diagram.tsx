import type { ReactNode } from "react";

// <MosfetDiagram frame="structure" | "off" | "channel" caption="…" /> — the n-channel MOSFET cross-section
// of hardware-fizica L7, one frame per idea, drawn as a static inline SVG.
//
//   structure  labelled parts only: Poartă, oxid SiO₂, Sursă n⁺, Drenă n⁺, substrat tip P, channel length L
//   off        V_GS < V_th: the gate field has pushed the holes away from under the oxide (dashed depletion
//              zone), there is no channel, the substrate is full of holes (+)
//   channel    V_GS > V_th: electrons (−) have collected under the oxide in a solid inversion layer that
//              joins Source and Drain; a thick V_GS arrow on the gate
//
// Rules this file follows (LESSON-STANDARD.md §6a):
//  • Server-compatible and stateless — no hooks, no animation, no client JS.
//  • Colours ONLY through Aurora tokens (Tailwind `fill-aurora-*` / `stroke-aurora-*`, which resolve to the
//    --aurora-* CSS variables or the Aurora palette, each with a `dark:` partner where the light value
//    would not read on a dark page). No hex in this file.
//  • State is carried by SHAPE and by a TEXT label, never by colour alone: dashed zone vs solid band,
//    hollow ○ with a plus (hole) vs filled ● with a minus (electron), a printed "V_GS < V_th" / "V_GS > V_th".
//  • One viewBox, width 100% (max 480px), no fixed pixel size. The viewBox is 400 units wide, so on a
//    390px phone the lesson column is ~332px wide, so 1 unit ≈ 0.83px: labels are 16 units (≈ 13.3px) and
//    the smallest text, the subscripts, 15 units (≈ 12.5px) — nothing renders under 12px (measured).
//  • role="img" with a Romanian <title> and <desc>, plus a visible <figcaption> saying what to look at.

export type MosfetFrame = "structure" | "off" | "channel";

interface MosfetDiagramProps {
  frame: MosfetFrame;
  /** One Romanian line: what to look at. Plain text, no double quotes. */
  caption: string;
}

const TEXT = "fill-aurora-text-primary";
const LINE = "stroke-aurora-text-secondary";
const METAL =
  "fill-aurora-primary-500/30 stroke-aurora-primary-700 dark:stroke-aurora-primary-300";
const N_PLUS = "fill-aurora-accent-500/25 stroke-aurora-accent-700 dark:stroke-aurora-accent-300";
const OXIDE = "fill-aurora-gold-500/60 stroke-aurora-gold-900 dark:stroke-aurora-gold-500";
const SUBSTRATE = "fill-aurora-primary-500/10 stroke-aurora-border-strong";
const HOLE = "fill-transparent stroke-aurora-primary-700 dark:stroke-aurora-primary-300";
const ELECTRON = "fill-aurora-accent-700 dark:fill-aurora-accent-300";
const ELECTRON_SIGN = "stroke-aurora-bg-card";

const META: Record<MosfetFrame, { title: string; desc: string }> = {
  structure: {
    title: "Secțiune transversală printr-un MOSFET cu canal n",
    desc: "Un substrat de siliciu de tip P în care stau două regiuni n⁺, Sursa și Drena, la distanța L, lungimea canalului. Între ele, deasupra substratului, un strat subțire de oxid SiO₂ și peste el poarta metalică.",
  },
  off: {
    title: "MOSFET sub tensiunea de prag: fără canal",
    desc: "Cu V GS mai mică decât V th, câmpul porții a împins golurile din substrat departe de oxid. Sub poartă rămâne o zonă de dezertare, fără canal, iar substratul e plin de goluri.",
  },
  channel: {
    title: "MOSFET peste tensiunea de prag: canal de electroni",
    desc: "Cu V GS mai mare decât V th, electronii se adună sub oxid într-un strat de inversie plin, care leagă Sursa de Drenă. Substratul de dedesubt are în continuare goluri.",
  },
};

/** V with a real subscript: dy lowers the subscript tspan, the next tspan restores the baseline. */
function Sub({ children }: { children: ReactNode }) {
  return (
    <>
      <tspan dy={5} fontSize={15}>
        {children}
      </tspan>
      <tspan dy={-5}>{"​"}</tspan>
    </>
  );
}

function VGS() {
  return (
    <>
      V<Sub>GS</Sub>
    </>
  );
}

function VTH() {
  return (
    <>
      V<Sub>th</Sub>
    </>
  );
}

/** ○ with a plus — a hole (the absence of an electron). Drawn at (cx, cy). */
function Hole({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      <circle r={8} className={HOLE} strokeWidth={1.8} />
      <path d="M-4 0H4M0 -4V4" className={HOLE} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

/** ● with a minus — an electron. */
function Electron({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      <circle r={r} className={ELECTRON} />
      <path d="M-3.5 0H3.5" className={ELECTRON_SIGN} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function MosfetDiagram({ frame, caption }: MosfetDiagramProps) {
  const isStructure = frame === "structure";
  const isChannel = frame === "channel";
  const { title, desc } = META[frame];
  const id = `mosfet-${frame}`;
  // The two bias frames carry hole rows and a legend, so they are taller than the labelled one.
  const height = isStructure ? 320 : 364;
  const substrateBottom = isStructure ? 308 : 320;

  return (
    <figure className="not-prose my-8">
      <svg
        viewBox={`0 0 400 ${height}`}
        role="img"
        aria-labelledby={`${id}-t ${id}-d`}
        className="mx-auto block h-auto w-full max-w-[480px]"
        fontSize={16}
        fontWeight={500}
      >
        <title id={`${id}-t`}>{title}</title>
        <desc id={`${id}-d`}>{desc}</desc>

        {/* ── bodies ── */}
        <rect x={20} y={112} width={360} height={substrateBottom - 112} rx={6} className={SUBSTRATE} strokeWidth={1.5} />
        <rect x={36} y={112} width={104} height={56} rx={4} className={N_PLUS} strokeWidth={1.5} />
        <rect x={260} y={112} width={104} height={56} rx={4} className={N_PLUS} strokeWidth={1.5} />
        <rect x={68} y={92} width={40} height={20} rx={2} className={METAL} strokeWidth={1.5} />
        <rect x={292} y={92} width={40} height={20} rx={2} className={METAL} strokeWidth={1.5} />
        <rect x={130} y={100} width={140} height={12} className={OXIDE} strokeWidth={1.5} />
        <rect x={140} y={62} width={120} height={38} rx={3} className={METAL} strokeWidth={1.5} />

        {/* ── name row + leaders (the same three names in every frame, for orientation) ── */}
        <text x={88} y={22} textAnchor="middle" className={TEXT}>
          Sursă n⁺
        </text>
        <text x={200} y={22} textAnchor="middle" className={TEXT}>
          {isStructure ? "Poartă (Gate)" : "Poartă"}
        </text>
        <text x={312} y={22} textAnchor="middle" className={TEXT}>
          Drenă n⁺
        </text>
        <path d="M88 30V92M312 30V92" className={LINE} strokeWidth={1.5} fill="none" aria-hidden="true" />

        {isStructure ? (
          <>
            <path d="M200 30V62" className={LINE} strokeWidth={1.5} fill="none" aria-hidden="true" />

            {/* oxide callout */}
            <path d="M200 136V114" className={LINE} strokeWidth={1.5} fill="none" aria-hidden="true" />
            <text x={200} y={152} textAnchor="middle" className={TEXT}>
              oxid SiO₂
            </text>

            {/* channel length L */}
            <path d="M140 168V196M260 168V196" className={LINE} strokeWidth={1.5} strokeDasharray="4 4" fill="none" aria-hidden="true" />
            <path d="M149 186H251" className={LINE} strokeWidth={1.5} fill="none" aria-hidden="true" />
            <path d="M140 186l9 -5v10zM260 186l-9 -5v10z" className="fill-aurora-text-secondary" aria-hidden="true" />
            <text x={200} y={214} textAnchor="middle" className={TEXT}>
              L — lungimea canalului
            </text>

            <text x={200} y={272} textAnchor="middle" className={TEXT}>
              substrat tip P
            </text>
          </>
        ) : (
          <>
            {/* gate voltage: a thin arrow below the threshold, a thick one above it */}
            <path d={`M200 30V${isChannel ? 50 : 52}`} className={LINE} strokeWidth={isChannel ? 4 : 1.5} fill="none" aria-hidden="true" />
            <path d="M200 62l-7 -11h14z" className="fill-aurora-text-secondary" aria-hidden="true" />
            <text x={214} y={51} className={TEXT}>
              <VGS />
              {isChannel ? " > " : " < "}
              <VTH />
            </text>

            {/* n⁺ regions always hold electrons */}
            <Electron cx={70} cy={142} />
            <Electron cx={106} cy={142} />
            <Electron cx={294} cy={142} />
            <Electron cx={330} cy={142} />

            {isChannel ? (
              <>
                {/* solid inversion layer: the channel */}
                <rect x={132} y={112} width={136} height={20} rx={10} className="fill-aurora-accent-500/50 stroke-aurora-accent-700 dark:stroke-aurora-accent-300" strokeWidth={3} />
                {[152, 176, 200, 224, 248].map((x) => (
                  <Electron key={x} cx={x} cy={122} r={6.5} />
                ))}
                <text x={200} y={160} textAnchor="middle" className={TEXT}>
                  strat de
                </text>
                <text x={200} y={180} textAnchor="middle" className={TEXT}>
                  inversie
                </text>
                <text x={200} y={200} textAnchor="middle" className={TEXT}>
                  (canalul)
                </text>
              </>
            ) : (
              <>
                {/* dashed depletion zone: holes repelled, no channel */}
                <rect x={140} y={112} width={120} height={72} rx={12} className="fill-aurora-primary-500/5 stroke-aurora-text-secondary" strokeWidth={2} strokeDasharray="6 5" />
                <text x={200} y={142} textAnchor="middle" className={TEXT}>
                  zonă de
                </text>
                <text x={200} y={164} textAnchor="middle" className={TEXT}>
                  dezertare
                </text>
              </>
            )}

            {/* holes fill the substrate in both frames */}
            {[56, 106, 156, 206, 256, 306, 350].map((x) => (
              <Hole key={`a${x}`} cx={x} cy={228} />
            ))}
            {[80, 130, 180, 230, 280, 330].map((x) => (
              <Hole key={`b${x}`} cx={x} cy={262} />
            ))}
            {[56, 106, 156, 206, 256, 306, 350].map((x) => (
              <Hole key={`c${x}`} cx={x} cy={296} />
            ))}

            {/* legend */}
            <Hole cx={36} cy={344} />
            <text x={52} y={349} className={TEXT}>
              gol (+)
            </text>
            <Electron cx={150} cy={344} />
            <text x={166} y={349} className={TEXT}>
              electron (−)
            </text>
          </>
        )}
      </svg>
      <figcaption className="mx-auto mt-3 max-w-[480px] text-center text-[15px] leading-snug text-aurora-text-secondary">
        {caption}
      </figcaption>
    </figure>
  );
}
