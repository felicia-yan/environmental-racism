"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const BLOCKS = [
  {
    id: "redlining",
    label: "Redlining +\ndisinvestment",
    bg: "rgba(180,120,20,0.15)",
    border: "rgba(160,100,10,0.4)",
  },
  {
    id: "pollution",
    label: "Polluting sites\nplaced nearby",
    bg: "rgba(200,90,20,0.15)",
    border: "rgba(180,70,10,0.4)",
  },
  {
    id: "exposure",
    label: "Disproportionate\nenv. exposure",
    bg: "rgba(200,50,30,0.15)",
    border: "rgba(180,40,20,0.4)",
  },
  {
    id: "health",
    label: "Higher rates of\nasthma & cancer",
    bg: "rgba(200,30,60,0.15)",
    border: "rgba(180,20,50,0.4)",
  },
] as const;

type BlockId = (typeof BLOCKS)[number]["id"];
const CORRECT_ORDER: BlockId[] = [
  "redlining",
  "pollution",
  "exposure",
  "health",
];

const BW = 180,
  BH = 80,
  GAP = 5;
const GRAVITY = 1800;
const BOUNCE = 0.18;

interface PhysicsBlock {
  id: BlockId;
  label: string;
  bg: string;
  border: string;
  x: number;
  y: number;
  vy: number;
  settled: boolean;
  targetIndex: number;
}

function groundY(h: number) {
  return h - 10;
}
function targetY(index: number, h: number) {
  return groundY(h) - (index + 1) * (BH + GAP) + BH / 2;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function FinalReflection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const towerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef<PhysicsBlock[]>([]);
  const stackRef = useRef<BlockId[]>([]);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number | null>(null);
  const draggingRef = useRef<(typeof BLOCKS)[number] | null>(null);
  const dragOffRef = useRef({ x: 0, y: 0 });

  const [usedIds, setUsedIds] = useState<BlockId[]>([]);
  const [completion, setCompletion] = useState<{
    show: boolean;
    correct: boolean;
  } | null>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = towerRef.current;
    if (!canvas || !wrap) return;
    const r = wrap.getBoundingClientRect();
    canvas.width = r.width;
    canvas.height = r.height;
  }, []);

  const isOverTower = useCallback((cx: number, cy: number) => {
    const r = towerRef.current?.getBoundingClientRect();
    if (!r) return false;
    return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  }, []);

  const getCanvasBlock = useCallback(
    (cx: number, cy: number): PhysicsBlock | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const r = canvas.getBoundingClientRect();
      const mx = cx - r.left,
        my = cy - r.top;
      const blocks = physicsRef.current;
      for (let i = blocks.length - 1; i >= 0; i--) {
        const p = blocks[i];
        if (
          mx >= p.x - BW / 2 &&
          mx <= p.x + BW / 2 &&
          my >= p.y - BH / 2 &&
          my <= p.y + BH / 2
        )
          return p;
      }
      return null;
    },
    []
  );

  const addToStack = useCallback((id: BlockId) => {
    if (stackRef.current.includes(id)) return;
    const b = BLOCKS.find((b) => b.id === id)!;
    const idx = stackRef.current.length;
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width / 2 : 110;
    physicsRef.current.push({
      id: b.id,
      label: b.label,
      bg: b.bg,
      border: b.border,
      x: cx,
      y: -BH,
      vy: 0,
      settled: false,
      targetIndex: idx,
    });
    stackRef.current.push(id);
    setUsedIds([...stackRef.current]);
  }, []);

  const removeFromStack = useCallback((id: BlockId) => {
    const idx = stackRef.current.indexOf(id);
    if (idx === -1) return;
    stackRef.current.splice(idx, 1);
    physicsRef.current = physicsRef.current.filter((p) => p.id !== id);
    physicsRef.current.forEach((p, i) => {
      p.targetIndex = i;
      p.settled = false;
    });
    setUsedIds([...stackRef.current]);
    setCompletion(null);
  }, []);

  const checkCompletion = useCallback(() => {
    if (stackRef.current.length < BLOCKS.length) return;
    const allSettled = physicsRef.current.every((p) => p.settled);
    if (!allSettled) {
      setTimeout(checkCompletion, 200);
      return;
    }
    const correct = stackRef.current.every((id, i) => CORRECT_ORDER[i] === id);
    setCompletion({ show: true, correct });
  }, []);

  const reset = useCallback(() => {
    stackRef.current = [];
    physicsRef.current = [];
    setUsedIds([]);
    setCompletion(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function update(dt: number) {
      const h = canvas!.height;
      physicsRef.current.forEach((p) => {
        if (p.settled) return;
        const ty = targetY(p.targetIndex, h);
        p.vy += GRAVITY * dt;
        p.y += p.vy * dt;
        if (p.y >= ty) {
          p.y = ty;
          p.vy = -p.vy * BOUNCE;
          if (Math.abs(p.vy) < 40) {
            p.vy = 0;
            p.settled = true;
          }
        }
      });
    }

    function draw() {
      const w = canvas!.width,
        h = canvas!.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, groundY(h), w, h - groundY(h));

      if (physicsRef.current.length === 0) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Drag blocks here", w / 2, h / 2);
      }

      physicsRef.current.forEach((p) => {
        const x = p.x - BW / 2,
          y = p.y - BH / 2;
        const correct = CORRECT_ORDER[p.targetIndex] === p.id;
        ctx.save();
        roundRect(ctx, x, y, BW, BH, 10);
        ctx.fillStyle = correct ? p.bg : "rgba(200,50,50,0.1)";
        ctx.fill();
        ctx.strokeStyle = correct ? p.border : "rgba(180,40,40,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = p.label.split("\n");
        const lh = 15;
        lines.forEach((line, i) => {
          ctx.fillText(line, p.x, p.y - ((lines.length - 1) * lh) / 2 + i * lh);
        });

        if (!correct && p.settled) {
          ctx.fillStyle = "rgba(180,40,40,0.8)";
          ctx.font = "10px sans-serif";
          ctx.fillText("wrong level", p.x, y + BH + 12);
        }
        ctx.restore();
      });
    }

    function loop(ts: number) {
      if (lastTsRef.current !== null)
        update(Math.min((ts - lastTsRef.current) / 1000, 0.05));
      lastTsRef.current = ts;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const moveGhost = (cx: number, cy: number) => {
    const g = ghostRef.current;
    if (!g) return;
    g.style.left = cx - dragOffRef.current.x + "px";
    g.style.top = cy - dragOffRef.current.y + "px";
  };

  const showGhost = (b: (typeof BLOCKS)[number], cx: number, cy: number) => {
    const g = ghostRef.current;
    if (!g) return;
    g.style.background = b.bg;
    g.style.borderColor = b.border;
    g.style.whiteSpace = "pre-line";
    g.textContent = b.label;
    g.style.opacity = "1";
    moveGhost(cx, cy);
  };

  const hideGhost = () => {
    if (ghostRef.current) ghostRef.current.style.opacity = "0";
  };

  const onPaletteMouseDown = (
    b: (typeof BLOCKS)[number],
    e: React.MouseEvent
  ) => {
    if (stackRef.current.includes(b.id)) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffRef.current = {
      x: e.clientX - r.left - BW / 2,
      y: e.clientY - r.top - BH / 2,
    };
    draggingRef.current = b;
    showGhost(b, e.clientX, e.clientY);
    e.preventDefault();
  };

  const onPaletteTouchStart = (
    b: (typeof BLOCKS)[number],
    e: React.TouchEvent
  ) => {
    if (stackRef.current.includes(b.id)) return;
    const t = e.touches[0];
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffRef.current = {
      x: t.clientX - r.left - BW / 2,
      y: t.clientY - r.top - BH / 2,
    };
    draggingRef.current = b;
    showGhost(b, t.clientX, t.clientY);
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingRef.current) moveGhost(e.clientX, e.clientY);
    };
    const onUp = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      if (isOverTower(e.clientX, e.clientY)) {
        addToStack(draggingRef.current.id);
        setTimeout(checkCompletion, 800);
      }
      draggingRef.current = null;
      hideGhost();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (draggingRef.current) {
        moveGhost(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      const t = e.changedTouches[0];
      if (isOverTower(t.clientX, t.clientY)) {
        addToStack(draggingRef.current.id);
        setTimeout(checkCompletion, 800);
      }
      draggingRef.current = null;
      hideGhost();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isOverTower, addToStack, checkCompletion]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getCanvasBlock(e.clientX, e.clientY);
    if (p) removeFromStack(p.id);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        padding: 20,
        minHeight: 620,
        background: "#f5f4f0",
        fontFamily: "sans-serif",
      }}
    >
      {/* Palette */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p
          style={{
            color: "rgba(0,0,0,0.85)",
            fontSize: 15,
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Build the system
        </p>
        <p
          style={{
            color: "rgba(0,0,0,0.45)",
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 14,
            maxWidth: 180,
          }}
        >
          Drag blocks into the tower. Root causes go at the bottom. Click a
          stacked block to remove it.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BLOCKS.map((b) => (
            <div
              key={b.id}
              onMouseDown={(e) => onPaletteMouseDown(b, e)}
              onTouchStart={(e) => onPaletteTouchStart(b, e)}
              style={{
                width: 160,
                height: 80,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 11,
                lineHeight: 1.4,
                color: "rgba(0,0,0,0.75)",
                cursor: usedIds.includes(b.id) ? "default" : "grab",
                padding: 10,
                border: `1px solid ${b.border}`,
                background: b.bg,
                opacity: usedIds.includes(b.id) ? 0.25 : 1,
                pointerEvents: usedIds.includes(b.id) ? "none" : "auto",
                userSelect: "none",
                whiteSpace: "pre-line",
                transition: "opacity 0.2s",
              }}
            >
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tower */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <p
          style={{
            color: "rgba(0,0,0,0.25)",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Health outcomes
        </p>
        <div
          ref={towerRef}
          style={{
            position: "relative",
            width: 220,
            flex: 1,
            border: "1px dashed rgba(0,0,0,0.15)",
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
          />

          {completion?.show && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.93)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "rgba(0,0,0,0.85)",
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 10,
                }}
              >
                {completion.correct
                  ? "Systems shape outcomes"
                  : "Close — try reordering"}
              </p>
              <p
                style={{
                  color: "rgba(0,0,0,0.5)",
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {completion.correct
                  ? "Health disparities don't emerge randomly. Redlining shaped where polluting infrastructure was placed, increasing environmental exposure over generations."
                  : "Some blocks are at the wrong level. Think about what must exist before the next effect becomes possible."}
              </p>
              <button
                onClick={reset}
                style={{
                  marginTop: 16,
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.2)",
                  background: "transparent",
                  color: "rgba(0,0,0,0.8)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
        <p
          style={{
            color: "rgba(0,0,0,0.25)",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Root causes
        </p>
        <p style={{ color: "rgba(0,0,0,0.2)", fontSize: 11 }}>
          Drop here · click stacked block to remove
        </p>
      </div>

      {/* Ghost */}
      <div
        ref={ghostRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9999,
          borderRadius: 10,
          width: 160,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 11,
          lineHeight: 1.4,
          color: "rgba(0,0,0,0.8)",
          padding: 10,
          border: "1px solid rgba(0,0,0,0.2)",
          opacity: 0,
          whiteSpace: "pre-line",
          transition: "opacity 0.1s",
        }}
      />
    </div>
  );
}
