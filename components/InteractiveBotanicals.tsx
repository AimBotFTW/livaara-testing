"use client";

import { useState, useId } from "react";

/* ─────────────────────────── Data ─────────────────────────── */
interface Ingredient {
  id: string;
  label: string;
  short: string;
  imageSrc: string;
  color: string;
  glow: string;
  angle: number; // degrees from centre, 0 = right
  emoji: string;
  title: string;
  description: string;
  benefit: string;
  origin: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: "bhringraj",
    label: "Bhringraj",
    short: "Bhringraj",
    imageSrc: "/images/Bhringraj1.jpeg",
    color: "#C8A96A",
    glow: "rgba(200,169,106,0.35)",
    angle: -105,
    emoji: "🌿",
    title: "Bhringraj — The King of Hair",
    description:
      "Revered across 5,000 years of Ayurvedic practice, Bhringraj (Eclipta alba) is the undisputed sovereign of hair tonics. Its alkaloids directly stimulate the dermal papilla cells — the biological engine of every hair follicle.",
    benefit: "Awakens dormant follicles · Accelerates natural growth · Restores lustrous depth",
    origin: "Sourced from organic farms in Rajasthan",
  },
  {
    id: "amla",
    label: "Amla",
    short: "Amla",
    imageSrc: "/images/Amla1.jpeg",
    color: "#7EB89A",
    glow: "rgba(126,184,154,0.35)",
    angle: 15,
    emoji: "🫐",
    title: "Amla — The Antioxidant Crown",
    description:
      "Indian Gooseberry (Phyllanthus emblica) contains 20× more Vitamin C than an orange, along with tannins and gallic acid that deeply condition both shaft and scalp. It neutralises free-radical oxidative stress that prematurely ages follicles.",
    benefit: "Seals the hair cuticle · Prevents premature greying · Deep scalp nourishment",
    origin: "Cold-pressed from Himalayan foothills harvest",
  },
  {
    id: "neem",
    label: "Neem",
    short: "Neem",
    imageSrc: "/images/Neem1.jpeg",
    color: "#A3C084",
    glow: "rgba(163,192,132,0.35)",
    angle: 135,
    emoji: "🍃",
    title: "Neem — The Ancient Purifier",
    description:
      "Azadirachta indica carries nimbidin and azadirachtin — powerful compounds that create a clinically-hostile environment for Malassezia fungi (the primary cause of dandruff) while simultaneously clearing clogged follicle openings to allow unimpeded growth.",
    benefit: "Eliminates dandruff · Unclogs follicle pores · Balances scalp microbiome",
    origin: "Cold-extracted from century-old Neem groves, Karnataka",
  },
];

/* ─────────────────────────── Geometry helpers ──────────────── */
const DEG = Math.PI / 180;
const RADIUS = 130; // px from centre to node centre (SVG coords)
const CX = 200;
const CY = 200;

// Inner image circle radius (matches the dashed inner ring)
const IMG_R_DEFAULT = 25;
const IMG_R_ACTIVE = 29;

function nodePos(angle: number) {
  return {
    x: CX + RADIUS * Math.cos(angle * DEG),
    y: CY + RADIUS * Math.sin(angle * DEG),
  };
}

/* ─────────────────────────── Component ─────────────────────── */
export function InteractiveBotanicals() {
  const [active, setActive] = useState<string | null>(null);
  const uid = useId();

  const activeIngredient = INGREDIENTS.find((i) => i.id === active) ?? null;

  const toggle = (id: string) => setActive((prev) => (prev === id ? null : id));

  return (
    <section className="bg-white border-y border-stone-200 py-20 md:py-32 overflow-hidden">
      <div className="container-px mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs tracking-[0.3em] uppercase text-[#C8A96A] font-medium mb-3 block">
            The Botanical Triad
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">
            Golden Ingredients
          </h2>
          <p className="text-stone-500 leading-relaxed">
            Tap each node to explore the botanical intelligence woven into every drop.
          </p>
        </div>

        {/* Root Network + Detail Panel */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* ── SVG Root Network ── */}
          <div className="w-full lg:w-auto flex-shrink-0 flex justify-center">
            <svg
              viewBox="0 0 400 400"
              className="w-[min(100%,360px)] lg:w-[400px] drop-shadow-sm select-none"
              aria-label="Interactive Root Network of Lomaras core ingredients"
            >
              <defs>
                {/* Radial glow for centre */}
                <radialGradient id={`${uid}-center-glow`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C8A96A" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#C8A96A" stopOpacity="0" />
                </radialGradient>

                {/* Per-ingredient glows */}
                {INGREDIENTS.map((ing) => (
                  <radialGradient
                    key={ing.id}
                    id={`${uid}-glow-${ing.id}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor={ing.color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={ing.color} stopOpacity="0" />
                  </radialGradient>
                ))}

                {/* ── Per-ingredient circular clipPaths ── */}
                {INGREDIENTS.map((ing) => {
                  const pos = nodePos(ing.angle);
                  const isActive = active === ing.id;
                  const r = isActive ? IMG_R_ACTIVE : IMG_R_DEFAULT;
                  return (
                    <clipPath key={`clip-${ing.id}`} id={`${uid}-clip-${ing.id}`}>
                      <circle cx={pos.x} cy={pos.y} r={r} />
                    </clipPath>
                  );
                })}

                {/* Animated root path marker */}
                <marker
                  id={`${uid}-dot`}
                  viewBox="0 0 6 6"
                  refX="3"
                  refY="3"
                  markerWidth="6"
                  markerHeight="6"
                >
                  <circle cx="3" cy="3" r="2.5" fill="#C8A96A" opacity="0.6" />
                </marker>
              </defs>

              {/* Decorative outer ring */}
              <circle
                cx={CX}
                cy={CY}
                r={RADIUS + 44}
                fill="none"
                stroke="#C8A96A"
                strokeWidth="0.5"
                strokeDasharray="4 8"
                opacity="0.25"
              />

              {/* Glow halo behind centre */}
              <circle cx={CX} cy={CY} r="70" fill={`url(#${uid}-center-glow)`} />

              {/* ── SVG lines from centre to each ingredient node ── */}
              {INGREDIENTS.map((ing) => {
                const pos = nodePos(ing.angle);
                const isActive = active === ing.id;
                return (
                  <g key={`line-${ing.id}`}>
                    {/* Glow behind active line */}
                    {isActive && (
                      <line
                        x1={CX}
                        y1={CY}
                        x2={pos.x}
                        y2={pos.y}
                        stroke={ing.color}
                        strokeWidth="6"
                        opacity="0.18"
                        strokeLinecap="round"
                      />
                    )}
                    {/* Main line */}
                    <line
                      x1={CX}
                      y1={CY}
                      x2={pos.x}
                      y2={pos.y}
                      stroke={isActive ? ing.color : "#D6C9B4"}
                      strokeWidth={isActive ? 1.8 : 1}
                      strokeDasharray={isActive ? "none" : "5 4"}
                      opacity={isActive ? 1 : 0.55}
                      strokeLinecap="round"
                      style={{ transition: "all 0.4s ease" }}
                    />
                    {/* Mid-point dot on root line */}
                    <circle
                      cx={(CX + pos.x) / 2}
                      cy={(CY + pos.y) / 2}
                      r={isActive ? 3 : 2}
                      fill={isActive ? ing.color : "#C8A96A"}
                      opacity={isActive ? 0.9 : 0.3}
                      style={{ transition: "all 0.35s ease" }}
                    />
                  </g>
                );
              })}

              {/* ── Ingredient node circles ── */}
              {INGREDIENTS.map((ing) => {
                const pos = nodePos(ing.angle);
                const isActive = active === ing.id;
                const outerR = isActive ? 38 : 33;
                const innerR = isActive ? IMG_R_ACTIVE : IMG_R_DEFAULT;
                // foreignObject dimensions (square that bounds the inner circle)
                const foSize = innerR * 2;
                const foX = pos.x - innerR;
                const foY = pos.y - innerR;

                return (
                  <g
                    key={`node-${ing.id}`}
                    onClick={() => toggle(ing.id)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`Explore ${ing.label}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggle(ing.id)}
                  >
                    {/* Glow halo */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isActive ? 46 : 34}
                      fill={`url(#${uid}-glow-${ing.id})`}
                      style={{ transition: "r 0.35s ease" }}
                    />

                    {/* Outer ring (white fill, coloured stroke) */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={outerR}
                      fill="white"
                      stroke={ing.color}
                      strokeWidth={isActive ? 2 : 1}
                      opacity={isActive ? 1 : 0.7}
                      style={{
                        transition: "all 0.35s ease",
                        filter: isActive ? `drop-shadow(0 0 8px ${ing.glow})` : "none",
                      }}
                    />

                    {/* Dashed inner ring (sits on top of photo for border effect) */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={innerR}
                      fill="none"
                      stroke={ing.color}
                      strokeWidth={isActive ? 1.2 : 0.8}
                      strokeDasharray="3 3"
                      opacity={isActive ? 0.9 : 0.45}
                      style={{ transition: "all 0.35s ease" }}
                    />

                    {/*
                     * ── Real botanical photo via foreignObject ──
                     *
                     * foreignObject lets us use a standard HTML <img> tag inside SVG,
                     * which is the only way to apply Tailwind utility classes
                     * (grayscale, mix-blend-luminosity, etc.) with CSS transitions.
                     *
                     * The <img> is clipped to a circle by overflow:hidden on a
                     * border-radius:50% wrapper div, matching innerR exactly.
                     */}
                    <foreignObject
                      x={foX}
                      y={foY}
                      width={foSize}
                      height={foSize}
                      style={{ transition: "all 0.35s ease" }}
                      // Pointer events pass through to the parent <g> onClick
                      pointerEvents="none"
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={ing.imageSrc}
                          alt={ing.label}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          className={[
                            "transition-all duration-700 ease-in-out",
                            isActive
                              ? // ── BLOOM: full colour ──
                                "grayscale-0 opacity-100 mix-blend-normal scale-110"
                              : // ── DEFAULT: muted / harmonised ──
                                "grayscale opacity-60 mix-blend-luminosity scale-100",
                          ].join(" ")}
                        />
                      </div>
                    </foreignObject>

                    {/* Name label below node */}
                    <text
                      x={pos.x}
                      y={pos.y + (isActive ? 51 : 46)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isActive ? ing.color : "#A8A29E"}
                      fontSize="9"
                      fontFamily="sans-serif"
                      letterSpacing="0.5"
                      style={{ transition: "all 0.3s ease" }}
                    >
                      {ing.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* ── Central Core Node ── */}
              <g>
                {/* Pulsing outer ring (CSS animation) */}
                <circle
                  cx={CX}
                  cy={CY}
                  r="52"
                  fill="none"
                  stroke="#C8A96A"
                  strokeWidth="0.8"
                  opacity="0.25"
                  className="animate-ping-slow"
                />
                <circle cx={CX} cy={CY} r="44" fill="white" stroke="#C8A96A" strokeWidth="1.5" />
                <circle
                  cx={CX}
                  cy={CY}
                  r="36"
                  fill="#FDF8F2"
                  stroke="#C8A96A"
                  strokeWidth="0.8"
                  strokeDasharray="4 3"
                />
                <text
                  x={CX}
                  y={CY - 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#C8A96A"
                  fontSize="11"
                  fontFamily="serif"
                  letterSpacing="1"
                >
                  LOMARAS
                </text>
                <text
                  x={CX}
                  y={CY + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#A8957A"
                  fontSize="7.5"
                  fontFamily="sans-serif"
                  letterSpacing="1.5"
                >
                  CORE
                </text>
              </g>
            </svg>
          </div>

          {/* ── Detail Panel ── */}
          <div className="flex-1 w-full min-h-[260px]">
            {activeIngredient ? (
              <div
                key={activeIngredient.id}
                className="opacity-0 translate-y-3 animate-fadein-up"
                style={
                  {
                    "--tw-fadein-duration": "0.4s",
                    animationFillMode: "forwards",
                  } as React.CSSProperties
                }
              >
                {/* Coloured accent bar */}
                <div
                  className="w-10 h-[3px] rounded-full mb-6"
                  style={{ backgroundColor: activeIngredient.color }}
                />

                <span className="text-3xl mb-4 block">{activeIngredient.emoji}</span>

                <h3
                  className="font-serif text-2xl md:text-3xl text-stone-900 mb-5 leading-snug"
                  style={{ color: activeIngredient.color }}
                >
                  {activeIngredient.title}
                </h3>

                <p className="text-stone-600 leading-relaxed text-base mb-6">
                  {activeIngredient.description}
                </p>

                {/* Benefits pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {activeIngredient.benefit.split("·").map((b) => (
                    <span
                      key={b}
                      className="text-xs font-medium tracking-wide px-3 py-1.5 rounded-full border"
                      style={{
                        borderColor: `${activeIngredient.color}55`,
                        color: activeIngredient.color,
                        backgroundColor: `${activeIngredient.color}10`,
                      }}
                    >
                      {b.trim()}
                    </span>
                  ))}
                </div>

                {/* Origin note */}
                <div className="flex items-center gap-2 text-stone-400 text-xs tracking-wider uppercase">
                  <div
                    className="w-4 h-[1px]"
                    style={{ backgroundColor: activeIngredient.color }}
                  />
                  {activeIngredient.origin}
                </div>
              </div>
            ) : (
              /* Idle placeholder */
              <div className="flex flex-col items-center lg:items-start justify-center h-full py-12 lg:py-0 opacity-60">
                <div className="w-8 h-[1px] bg-[#C8A96A] mb-6" />
                <p className="font-serif text-xl text-stone-400 mb-2 text-center lg:text-left">
                  Select an ingredient
                </p>
                <p className="text-stone-400 text-sm text-center lg:text-left leading-relaxed max-w-xs">
                  Tap any node in the network to reveal the science and sourcing behind each
                  botanical.
                </p>
                {/* Animated hint arrows */}
                <div className="flex gap-1 mt-6 text-[#C8A96A]">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="opacity-0 animate-fadein-up"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Inline keyframes for animations not in Tailwind by default ── */}
      <style>{`
        @keyframes fadein-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein-up {
          animation: fadein-up 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.18); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          transform-origin: 200px 200px;
        }
      `}</style>
    </section>
  );
}
