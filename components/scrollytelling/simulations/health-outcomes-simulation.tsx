"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Wind,
  Brain,
  Baby,
  Activity,
  AlertTriangle,
} from "lucide-react";

/* -----------------------------
   CONFIG
------------------------------ */

const MIN_X = 40;
const MAX_X = 970;

const HIGHWAY_X = 1150;

const HOUSE_WIDTH = 177;

// smaller displayed distances
const MAX_METERS = 900;
const MIN_METERS = 15;

/* -----------------------------
   HELPERS
------------------------------ */

function exposureFactor(distanceM: number) {
  return Math.exp(-distanceM / 350);
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(c1: string, c2: string, t: number) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);

  return `rgb(
    ${Math.round(lerp(a.r, b.r, t))},
    ${Math.round(lerp(a.g, b.g, t))},
    ${Math.round(lerp(a.b, b.b, t))}
  )`;
}

/* -----------------------------
   TOOLTIP CONTENT
------------------------------ */
const GLOSSARY: Record<string, string> = {
  "PM2.5":
    "Fine particulate matter smaller than 2.5 micrometers that can penetrate deep into the lungs and bloodstream.",

  NOx: "Nitrogen oxides, or air pollutants produced mainly by vehicles and combustion processes.",

  "acute myocardial infarction":
    "A heart attack caused by blocked blood flow to the heart muscle.",

  "black carbon":
    "Soot-like air pollution created from combustion, especially diesel engines and wildfire smoke.",

  CO: "Carbon monoxide, a harmful gas produced by burning fuel.",

  preeclampsia:
    "A dangerous pregnancy complication involving high blood pressure and organ stress.",

  pPROM:
    "Preterm premature rupture of membranes, or when the amniotic sac breaks too early during pregnancy.",

  cardiopulmonary: "Related to the heart or lungs.",

  "coronary heart disease":
    "The narrowing or blockage of the major arteries that supply oxygen-rich blood to your heart.",
};

const TOOLTIP_ZONES = [
  {
    threshold: 100,
    title: "Within 100 meters",
    text: [
      "PM2.5 exposure increases by ~30%",
      "NOx exposure increases by ~37%",
      "5% increase in acute myocardial infarction",
      "1.95% higher risk of cardiopulmonary mortality",
    ],
  },

  {
    threshold: 200,
    title: "Within 200 meters",
    text: [
      "8% higher odds of stroke mortality",
      "Greater exposure to ultrafine particles and black carbon",
      "Elevated asthma and reduced lung function risks",
      "Higher concentrations of CO and black carbon",
    ],
  },

  {
    threshold: 300,
    title: "Within 300 meters",
    text: [
      "1.3× increased odds of preeclampsia",
      "1.6× increased odds of pPROM",
      "1.4× increased odds of preterm birth",
      "Increased risk for coronary heart disease",
      "Higher likelihood of autism linked to third-trimester exposure",
    ],
  },
];

function GlossaryTerm({ children }: { children: string }) {
  const definition = GLOSSARY[children];

  if (!definition) return <>{children}</>;

  return (
    <span className="relative inline-block group cursor-help">
      <span className="underline decoration-dotted underline-offset-2 text-blue-700">
        {children}
      </span>

      <span
        className="
          pointer-events-none
          absolute
          left-1/2
          top-full
          z-[100]
          mt-2
          w-[240px]
          -translate-x-1/2
          rounded-xl
          bg-black
          px-3
          py-2
          text-xs
          leading-relaxed
          text-white
          opacity-0
          shadow-2xl
          transition-opacity
          duration-150
          group-hover:opacity-100
        "
      >
        {definition}
      </span>
    </span>
  );
}

/* -----------------------------
   MAIN COMPONENT
------------------------------ */

export function HealthOutcomesSimulation() {
  const [x, setX] = useState(120);

  const houseRight = x + HOUSE_WIDTH;

  const pixelDistance = HIGHWAY_X - houseRight;

  const distanceM = useMemo(() => {
    const minPixelGap = 10; // almost touching freeway
    const maxPixelGap = HIGHWAY_X - HOUSE_WIDTH - MIN_X;

    const normalized =
      (pixelDistance - minPixelGap) / (maxPixelGap - minPixelGap);

    const eased = Math.pow(Math.max(0, Math.min(1, normalized)), 0.82);

    return Math.round(MIN_METERS + eased * (MAX_METERS - MIN_METERS));
  }, [pixelDistance]);

  const exposure = exposureFactor(distanceM);

  /* -----------------------------
     ACTIVE TOOLTIP
  ------------------------------ */

  const activeTooltip = useMemo(() => {
    if (distanceM <= 120) return TOOLTIP_ZONES[0];
    if (distanceM <= 260) return TOOLTIP_ZONES[1];
    if (distanceM <= 420) return TOOLTIP_ZONES[2];

    return null;
  }, [distanceM]);

  /* -----------------------------
     HEALTH METRICS
  ------------------------------ */

  const trpIncrease = useMemo(() => {
    return Math.max(0, Math.round(75 * Math.exp(-(distanceM - 250) / 400)));
  }, [distanceM]);

  const lungImpact = useMemo(() => {
    if (distanceM <= 500) {
      return Math.round(35 + (500 - distanceM) * 0.05);
    }

    if (distanceM <= 1000) {
      return Math.round(18 - (distanceM - 500) * 0.02);
    }

    return 5;
  }, [distanceM]);

  const asthmaRisk = useMemo(() => {
    return Math.round(10 + exposure * 35);
  }, [exposure]);

  const cardioRisk = useMemo(() => {
    return Math.round(8 + exposure * 28);
  }, [exposure]);

  function getImpactIcon(text: string) {
    if (
      text.includes("heart") ||
      text.includes("myocardial") ||
      text.includes("cardio") ||
      text.includes("coronary")
    ) {
      return <HeartPulse className="w-5 h-5 text-rose-500" />;
    }

    if (
      text.includes("lung") ||
      text.includes("PM2.5") ||
      text.includes("NOx") ||
      text.includes("black carbon") ||
      text.includes("CO")
    ) {
      return <Wind className="w-5 h-5 text-sky-500" />;
    }

    if (text.includes("autism")) {
      return <Brain className="w-5 h-5 text-violet-500" />;
    }

    if (
      text.includes("preeclampsia") ||
      text.includes("pPROM") ||
      text.includes("birth")
    ) {
      return <Baby className="w-5 h-5 text-pink-500" />;
    }

    if (
      text.includes("stroke") ||
      text.includes("mortality") ||
      text.includes("asthma")
    ) {
      return <Activity className="w-5 h-5 text-orange-500" />;
    }

    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  }

  function getSystemLabel(text: string) {
    if (
      text.includes("heart") ||
      text.includes("myocardial") ||
      text.includes("coronary") ||
      text.includes("cardio")
    ) {
      return "Heart";
    }

    if (
      text.includes("lung") ||
      text.includes("PM2.5") ||
      text.includes("NOx") ||
      text.includes("black carbon") ||
      text.includes("CO") ||
      text.includes("asthma") ||
      text.includes("respiratory")
    ) {
      return "Lungs";
    }

    if (
      text.includes("preeclampsia") ||
      text.includes("pPROM") ||
      text.includes("birth")
    ) {
      return "Pregnancy";
    }

    if (text.includes("autism")) {
      return "Brain & development";
    }

    if (text.includes("stroke")) {
      return "Brain & blood flow";
    }

    return "Multiple body systems";
  }

  return (
    <div className="relative w-full min-h-[95vh] overflow-hidden border border-white/10 select-none">
      {/* BACKGROUND */}
      <img
        src="/health/bg-health.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ATMOSPHERIC OVERLAY */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: lerpColor("#8FE8FF", "#10181c", exposure),
          mixBlendMode: "multiply",
          opacity: 0.7,
        }}
      />

      {/* INSTRUCTIONS */}
      <div className="absolute left-5 top-5 z-30 max-w-[300px] rounded-xl bg-white/75 backdrop-blur-sm p-4 text-black shadow-xl">
        <p className="text-sm leading-relaxed">
          Drag the house to change how far she lives from the freeway and see
          the impact on long-term health risks.
        </p>
      </div>

      {/* DISTANCE LINE */}
      {houseRight < HIGHWAY_X && (
        <div
          className="absolute top-[58%] z-30"
          style={{
            left: `${houseRight}px`,
            width: `${HIGHWAY_X - houseRight}px`,
          }}
        >
          {/* line */}
          <div className="relative h-[3px] bg-white">
            {/* left tick */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-green-200" />

            {/* right tick */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-green-200" />
          </div>

          {/* label */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-semibold text-white">
            {distanceM} m
          </div>
        </div>
      )}

      {/* TOOLTIP POPUP */}
      <AnimatePresence mode="wait">
        {activeTooltip && (
          <motion.div
            key={activeTooltip.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 top-[14%] z-50 -translate-x-1/2"
          >
            {/* Title */}
            <div className="mb-4 text-center">
              <div className="inline-block rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-black shadow-lg">
                {activeTooltip.title} from freeway
              </div>
            </div>

            {/* Cards */}
            <div
              className="
    flex
    flex-nowrap
    justify-center
    items-stretch
    gap-4
    max-w-[1800px]
  "
            >
              {activeTooltip.text.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 14, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.05,
                  }}
                  className="
        w-[240px]
        min-h-[150px]
        rounded-3xl
        bg-white/95
        backdrop-blur-xl
        border border-black/10
        shadow-2xl
        p-5
        flex
        flex-col
      "
                >
                  {/* icon + label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="
            w-10
            h-10
            rounded-2xl
            bg-black/5
            flex
            items-center
            justify-center
            shrink-0
          "
                    >
                      {getImpactIcon(item)}
                    </div>

                    <div>
                      {/* <div className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                        Health impact
                      </div> */}

                      <div className="text-md font-semibold text-black/85">
                        {getSystemLabel(item)}
                      </div>
                    </div>
                  </div>

                  {/* content */}
                  <div className="text-[16px] leading-relaxed text-black/85 font-medium">
                    {item
                      .split(
                        /(PM2\.5|NOx|acute myocardial infarction|black carbon|CO|preeclampsia|pPROM|autism|cardiopulmonary|coronary heart disease)/g
                      )
                      .map((part, i) => {
                        if (GLOSSARY[part]) {
                          return <GlossaryTerm key={i}>{part}</GlossaryTerm>;
                        }

                        return <span key={i}>{part}</span>;
                      })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HOUSE */}
      <motion.div
        drag="x"
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: MIN_X,
          right: MAX_X,
        }}
        style={{ x }}
        onDrag={(_, info) => {
          setX((prev) => Math.max(MIN_X, Math.min(MAX_X, prev + info.delta.x)));
        }}
        className="absolute top-1/2 -translate-y-1/4 z-40 cursor-grab active:cursor-grabbing"
      >
        <div className="relative w-[180px] h-[180px]">
          {/* HOUSE */}
          <img
            src="/health/house.png"
            alt="House"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
          />

          {/* CHARACTER */}
          <img
            src="/redlining/yellow idle.png"
            alt="Character"
            className="absolute left-1/2 bottom-7 -translate-x-1/2 w-10 object-contain pointer-events-none z-10"
          />
        </div>
      </motion.div>
    </div>
  );
}
