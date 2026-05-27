"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { CheckCircle2, ShieldX, Users, Route } from "lucide-react";

/* -----------------------------
   TYPES
------------------------------ */

type Point = { x: number; y: number };
type CharacterType = "circle" | "square";

interface Neighborhood {
  id: number;
  name: string;
  x: number;
  y: number;
  radius: number;
  circleRatio: number;
  wealth: number;
}

interface Protester {
  id: string;
  nhId: number;
  type: CharacterType;
  x: number;
  y: number;
  animOffset: number;
}

/* -----------------------------
   NEIGHBORHOODS
------------------------------ */

const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 1,
    name: "Millbrook Heights",
    x: 0.15,
    y: 0.5,
    radius: 0.4,
    circleRatio: 0.75,
    wealth: 0.85,
  },
  {
    id: 2,
    name: "Eastgate",
    x: 0.84,
    y: 0.35,
    radius: 0.3,
    circleRatio: 0.2,
    wealth: 0.9,
  },
  {
    id: 3,
    name: "Red Ridge",
    x: 0.56,
    y: 0.35,
    radius: 0.3,
    circleRatio: 0.8,
    wealth: 0.3,
  },
  {
    id: 4,
    name: "South Cross",
    x: 0.83,
    y: 0.56,
    radius: 0.3,
    circleRatio: 0.15,
    wealth: 0.4,
  },
];

function neighborhoodResistance(nh: Neighborhood): number {
  return nh.wealth * 0.7 + (1 - nh.circleRatio) * 0.3;
}

function protesterCount(nh: Neighborhood, overlap: number): number {
  if (overlap < 0.05) return 0;
  const power = neighborhoodResistance(nh);
  return Math.round(power * 8 + 1);
}

const MIN_PATH_LENGTH = 0.2;
const OVERLAP_THRESHOLD = 0.25;
const MIN_DRAW_Y = 0.3;

/* -----------------------------
   HELPERS
------------------------------ */

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pathLength(points: Point[]) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += distance(points[i - 1], points[i]);
  }
  return len;
}

function computeNeighborhoodOverlaps(path: Point[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const nh of NEIGHBORHOODS) counts[nh.id] = 0;

  for (const p of path) {
    for (const nh of NEIGHBORHOODS) {
      const d = distance(p, { x: nh.x, y: nh.y });
      if (d < nh.radius) {
        counts[nh.id] += 1 - d / nh.radius;
      }
    }
  }

  const result: Record<number, number> = {};
  for (const nh of NEIGHBORHOODS) {
    result[nh.id] = path.length === 0 ? 0 : counts[nh.id] / path.length;
  }
  return result;
}

function computeTotalResistance(overlaps: Record<number, number>): number {
  let total = 0;

  for (const nh of NEIGHBORHOODS) {
    const overlap = overlaps[nh.id];

    if (overlap > 0.02) {
      total += overlap * neighborhoodResistance(nh);
    }
  }

  return total;
}

function generateProtesters(
  nh: Neighborhood,
  count: number,
  seed: number
): Protester[] {
  const protesters: Protester[] = [];

  let s = seed * 9301 + 49297;

  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  for (let i = 0; i < count; i++) {
    const isCircle = rand() < nh.circleRatio;
    const angle = rand() * Math.PI * 2;
    const dist = rand() * 0.07 + 0.02;

    protesters.push({
      id: `${nh.id}-${i}`,
      nhId: nh.id,
      type: isCircle ? "circle" : "square",
      x: nh.x * 100 + Math.cos(angle) * dist * 100,
      y: nh.y * 100 + Math.sin(angle) * dist * 80,
      animOffset: rand() * 2,
    });
  }

  return protesters;
}

/* -----------------------------
   PROTESTERS
------------------------------ */

function Protester({ p, showProtest }: { p: Protester; showProtest: boolean }) {
  const color = p.type === "circle" ? "blue" : "yellow";
  const src = `/redlining/${color} idle.png`;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        transform: "translate(-50%, -100%)",
        width: 26,
        height: 36,
        opacity: showProtest ? 1 : 0,
        transition: `opacity 0.4s ease ${p.animOffset * 0.1}s`,
        zIndex: 20,
      }}
    >
      {showProtest && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold bg-white text-black px-1 py-0.5 rounded border border-black leading-none"
          style={{ zIndex: 21 }}
        >
          NO!
        </div>
      )}

      <img
        src={src}
        alt=""
        style={{
          imageRendering: "pixelated",
          width: "28px",
          height: "36px",
          display: "block",
          objectFit: "fill",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* -----------------------------
   LABELS
------------------------------ */
function NeighborhoodLabels({
  overlaps,
}: {
  overlaps: Record<number, number>;
}) {
  return (
    <>
      {NEIGHBORHOODS.map((nh) => {
        const isHit = (overlaps[nh.id] ?? 0) > 0.02;

        // keep labels inside screen bounds
        const clampedX = Math.max(0.08, Math.min(0.92, nh.x));

        // place label above neighborhood but not too high
        const labelY = Math.max(0.12, nh.y - nh.radius * 0.3);

        return (
          <div
            key={nh.id}
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              left: `${clampedX * 100}%`,
              top: `${labelY * 100}%`,
              transform: "translate(-50%, -100%)",
              opacity: isHit ? 1 : 0.85,
              zIndex: 50,
            }}
          >
            <div className="text-center">
              <div className="text-[10px] md:text-xs font-bold text-white drop-shadow-lg bg-black/60 px-2 py-1 rounded-full whitespace-nowrap border border-white/20">
                {nh.name}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

/* -----------------------------
   RESISTANCE BAR
------------------------------ */

function ResistanceMeter({
  value,
  threshold,
}: {
  value: number;
  threshold: number;
}) {
  const pct = Math.min(1, value / (threshold * 1.5)) * 100;
  const blocked = value > threshold;

  return (
    <div className="w-[260px]">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-white/80">Community Resistance</span>

        <span
          className={
            blocked ? "text-red-400 font-bold" : "text-green-300 font-medium"
          }
        >
          {blocked ? "HIGH" : "LOW"}
        </span>
      </div>

      <div className="h-3 rounded-full overflow-hidden bg-white/15">
        <div
          className={`h-full transition-all duration-300 ${
            blocked
              ? "bg-red-500"
              : value > threshold * 0.6
              ? "bg-yellow-400"
              : "bg-green-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -----------------------------
   RESULT NOTIFICATION
------------------------------ */
function ResultNotification({
  approved,
  blockedBy,
}: {
  approved: boolean;
  blockedBy: Neighborhood[];
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md text-sm max-w-[340px] ${
          approved
            ? "bg-green-500/90 border-green-300 text-white"
            : "bg-red-500/90 border-red-300 text-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {approved ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <ShieldX className="w-5 h-5 shrink-0" />
          )}

          <div className="font-bold text-base">
            {approved ? "Proposal Approved" : "Proposal Blocked"}
          </div>
        </div>

        <div className="opacity-95 leading-relaxed flex gap-2">
          <Route className="w-4 h-4 mt-0.5 shrink-0 opacity-90" />

          <div>
            {approved
              ? "The highway extension moved forward despite neighborhood impacts."
              : "Opposition from nearby residents stopped the proposal."}
          </div>
        </div>

        {!approved && blockedBy.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-90 mb-2">
              <Users className="w-3.5 h-3.5" />
              Community Opposition
            </div>

            <div className="flex flex-wrap gap-1.5">
              {blockedBy.map((nh) => (
                <div
                  key={nh.id}
                  className="px-2 py-1 rounded-full bg-white/15 border border-white/20 text-[11px]"
                >
                  {nh.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -----------------------------
   DRAW CANVAS
------------------------------ */

function MapCanvas({
  path,
  setPath,
  locked,
}: {
  path: Point[];
  setPath: (p: Point[] | ((prev: Point[]) => Point[])) => void;
  locked: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const drawing = useRef(false);

  const getPoint = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();

    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.max(
        MIN_DRAW_Y,
        Math.min(1, (e.clientY - rect.top) / rect.height)
      ),
    };
  };

  const onDown = (e: React.MouseEvent) => {
    if (locked) return;

    drawing.current = true;
    setPath([getPoint(e)]);
  };

  const onMove = (e: React.MouseEvent) => {
    if (!drawing.current || locked) return;

    setPath((prev: Point[]) => [...prev, getPoint(e)]);
  };

  const onUp = () => {
    drawing.current = false;
  };

  return (
    <div
      ref={ref}
      className="absolute inset-0 w-full h-full z-10"
      style={{
        touchAction: "none",
        cursor: locked ? "default" : "crosshair",
      }}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {path.length > 1 && (
          <>
            <polyline
              points={path.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
              fill="none"
              stroke="#52592B"
              strokeWidth="5"
            />

            <polyline
              points={path.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
              fill="none"
              stroke="#f0e68c"
              strokeWidth="0.25"
              strokeDasharray="1.5 1.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}

/* -----------------------------
   MAIN
------------------------------ */

export function SacrificeZonesSimulation() {
  const [path, setPath] = useState<Point[]>([]);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);

  const length = useMemo(() => pathLength(path), [path]);

  const overlaps = useMemo(() => computeNeighborhoodOverlaps(path), [path]);

  const totalResistance = useMemo(
    () => computeTotalResistance(overlaps),
    [overlaps]
  );

  const allProtesters = useMemo(() => {
    const out: Protester[] = [];

    for (const nh of NEIGHBORHOODS) {
      const overlap = overlaps[nh.id] ?? 0;
      const count = protesterCount(nh, overlap);

      out.push(...generateProtesters(nh, count, nh.id * 137));
    }

    return out;
  }, [overlaps]);

  const canSubmit = !locked && path.length > 2 && length > MIN_PATH_LENGTH;

  const submit = () => {
    const blocked = totalResistance > OVERLAP_THRESHOLD;

    setResult(!blocked);
    setLocked(true);
  };

  const reset = () => {
    setPath([]);
    setLocked(false);
    setResult(null);
  };

  const blockedBy = NEIGHBORHOODS.filter(
    (nh) => (overlaps[nh.id] ?? 0) > 0.02 && neighborhoodResistance(nh) > 0.45
  );

  return (
    <div className="relative flex-1 min-h-[95vh] min-w-[100vw]">
      {/* MAP */}
      <div className="absolute inset-0">
        <Image
          src="/siting/bg-siting.png"
          alt="Neighborhood map"
          fill
          className="object-cover object-bottom"
          priority
        />

        {/* Labels */}
        <NeighborhoodLabels overlaps={overlaps} />

        {/* Road canvas BELOW protesters */}
        <MapCanvas path={path} setPath={setPath} locked={locked} />

        {/* Protesters ABOVE road */}
        {allProtesters.map((p) => (
          <Protester key={p.id} p={p} showProtest={locked} />
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute left-4 top-4 z-20 max-w-[280px] rounded-xl bg-white/70 backdrop-blur-sm p-4 text-sm text-black shadow-lg">
        <p className="opacity-80 leading-relaxed">
          Draw a highway route through the city and try to get it approved. What
          happens when you cut through a neighborhood?
        </p>
      </div>

      {/* Resistance bar only */}
      <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <ResistanceMeter
          value={totalResistance}
          threshold={OVERLAP_THRESHOLD}
        />
      </div>

      {/* Submit */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
        <button
          onClick={canSubmit ? submit : reset}
          disabled={!canSubmit && path.length === 0}
          className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full disabled:opacity-30 hover:bg-gray-100 transition-colors shadow-lg"
        >
          {path.length === 0 ? (
            "Draw your route"
          ) : canSubmit ? (
            <>
              <Check className="w-4 h-4" />
              Submit Proposal
            </>
          ) : (
            "Keep drawing…"
          )}
        </button>
      </div>

      {/* Notification */}
      {locked && result !== null && (
        <ResultNotification approved={result} blockedBy={blockedBy} />
      )}
    </div>
  );
}
