"use client";
import { useEffect, useRef } from "react";

export type CharMode = "idle" | "typing" | "hidden" | "success" | "error";

interface Props {
  mode: CharMode;
}

export function AnimatedCharacters({ mode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());

  // Body group refs
  const purpleBodyRef = useRef<SVGGElement>(null);
  const blackBodyRef = useRef<SVGGElement>(null);
  const yellowBodyRef = useRef<SVGGElement>(null);
  const orangeBodyRef = useRef<SVGGElement>(null);

  // Eye/pupil refs — 7 eyes total
  const eyeGroupRefs = useRef<(SVGGElement | SVGCircleElement | SVGPathElement | null)[]>(Array(7).fill(null));
  const pupilRefs = useRef<(SVGCircleElement | null)[]>(Array(7).fill(null));
  const smoothEye = useRef(
    // [cx, cy] of each eye in SVG space
    [
      { x: 258, y: 195 }, { x: 322, y: 195 }, // purple
      { x: 368, y: 305 }, { x: 412, y: 305 }, // black
      { x: 470, y: 355 },                       // yellow
      { x: 175, y: 450 }, { x: 235, y: 450 },  // orange
    ]
  );

  // Smooth body transforms
  const smoothBody = useRef({
    purple: { tx: 0, ty: 0, rot: 0 },
    black:  { tx: 0, ty: 0, rot: 0 },
    yellow: { tx: 0, ty: 0, rot: 0 },
    orange: { tx: 0, ty: 0, rot: 0 },
  });

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 600,
        y: ((e.clientY - rect.top) / rect.height) * 600,
      };
    };
    window.addEventListener("mousemove", onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Eye definitions: [cx, cy, r, isSolid]
    const EYES: [number, number, number, boolean][] = [
      [258, 195, 7, false],
      [322, 195, 7, false],
      [368, 305, 6, false],
      [412, 305, 6, false],
      [470, 355, 5, false],
      [175, 450, 8, true],
      [235, 450, 8, true],
    ];

    const tick = (now: number) => {
      const t = (now - startTimeRef.current) / 1000; // seconds
      const mouse = mouseRef.current;
      const currentMode = modeRef.current;

      // ── IDLE BODY ANIMATIONS ──────────────────────────────────────────────
      // Each character gets its own sine wave offset so they feel independent
      const purpleIdle = {
        tx: Math.sin(t * 0.9 + 0) * 4,
        ty: Math.sin(t * 1.1 + 0) * 6,
        rot: Math.sin(t * 0.7 + 0) * 2.5,
      };
      const blackIdle = {
        tx: Math.sin(t * 1.3 + 2) * 3,
        ty: Math.sin(t * 0.8 + 1) * 5,
        rot: Math.sin(t * 1.0 + 1.5) * 2,
      };
      const yellowIdle = {
        tx: Math.sin(t * 1.1 + 4) * 3,
        ty: Math.sin(t * 1.4 + 2) * 6,
        rot: Math.sin(t * 0.9 + 3) * 2,
      };
      const orangeIdle = {
        tx: Math.sin(t * 0.8 + 1) * 5,
        ty: Math.sin(t * 1.2 + 3) * 7,
        rot: Math.sin(t * 1.1 + 0.5) * 3,
      };

      // ── CURSOR LEAN ───────────────────────────────────────────────────────
      // Bodies lean towards mouse a little — the peek effect
      let leanX = 0, leanY = 0;
      if (mouse) {
        // Normalise: center of SVG is 300,400. Map to -1..1
        leanX = ((mouse.x - 300) / 300) * 8; // max 8px horizontal lean
        leanY = ((mouse.y - 400) / 300) * 6; // max 6px vertical lean
      }

      // Mode overrides
      const isError   = currentMode === "error";
      const isSuccess = currentMode === "success";

      // Target transforms for each body
      const targets = {
        purple: {
          tx: purpleIdle.tx + leanX * 0.8,
          ty: purpleIdle.ty + leanY * 0.6 + (isSuccess ? -8 : isError ? 3 : 0),
          rot: purpleIdle.rot + (isError ? -10 : 0),
        },
        black: {
          tx: blackIdle.tx + leanX * 0.5,
          ty: blackIdle.ty + leanY * 0.4,
          rot: blackIdle.rot + (isError ? 5 : 0),
        },
        yellow: {
          tx: yellowIdle.tx + leanX * 0.6,
          ty: yellowIdle.ty + leanY * 0.5 + (isSuccess ? -5 : 0),
          rot: yellowIdle.rot,
        },
        orange: {
          tx: orangeIdle.tx + leanX * 1.0,
          ty: orangeIdle.ty + leanY * 0.8 + (isSuccess ? -9 : isError ? 4 : 0),
          rot: orangeIdle.rot,
        },
      };

      // Lerp smooth body
      const sb = smoothBody.current;
      const BODY_LERP = 0.06; // slow = floaty/alive feel
      for (const key of ["purple", "black", "yellow", "orange"] as const) {
        sb[key].tx  = lerp(sb[key].tx,  targets[key].tx,  BODY_LERP);
        sb[key].ty  = lerp(sb[key].ty,  targets[key].ty,  BODY_LERP);
        sb[key].rot = lerp(sb[key].rot, targets[key].rot, BODY_LERP);
      }

      // Apply to DOM
      const applyBody = (
        ref: React.RefObject<SVGGElement | null>,
        k: keyof typeof sb,
        origin: string
      ) => {
        const el = ref.current;
        if (!el) return;
        const { tx, ty, rot } = sb[k];
        el.setAttribute(
          "transform",
          `translate(${tx}, ${ty}) rotate(${rot}, ${origin})`
        );
      };
      applyBody(purpleBodyRef, "purple", "290 500");
      applyBody(blackBodyRef,  "black",  "390 520");
      applyBody(yellowBodyRef, "yellow", "470 520");
      applyBody(orangeBodyRef, "orange", "205 530");

      // ── EYE TRACKING ─────────────────────────────────────────────────────
      EYES.forEach(([cx, cy, r, isSolid], i) => {
        const size = r * 1.8;
        let targetX = cx;
        let targetY = cy;

        if (mouse) {
          const vx = mouse.x - cx;
          const vy = mouse.y - cy;
          const dist = Math.hypot(vx, vy) || 1;
          const mag = Math.min(size * 1.2, dist * 0.08);
          targetX = cx + (vx / dist) * mag;
          targetY = cy + (vy / dist) * mag;
        }

        const EYE_LERP = 0.18;
        smoothEye.current[i].x = lerp(smoothEye.current[i].x, targetX, EYE_LERP);
        smoothEye.current[i].y = lerp(smoothEye.current[i].y, targetY, EYE_LERP);

        const dx = smoothEye.current[i].x - cx;
        const dy = smoothEye.current[i].y - cy;

        const el = eyeGroupRefs.current[i];
        if (el) el.setAttribute("transform", `translate(${dx}, ${dy})`);

        if (!isSolid) {
          const pupil = pupilRefs.current[i];
          if (pupil && mouse) {
            const vx = mouse.x - cx;
            const vy = mouse.y - cy;
            const dist = Math.hypot(vx, vy) || 1;
            const mag = Math.min(size * 0.5, dist * 0.05);
            pupil.setAttribute("cx", String(cx + (vx / dist) * mag));
            pupil.setAttribute("cy", String(cy + (vy / dist) * mag));
          }
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Mouth paths ──────────────────────────────────────────────────────────
  const orangeMouth =
    mode === "success" ? "M180 470 Q205 500 230 470"
    : mode === "error" ? "M180 485 Q205 460 230 485"
    : mode === "typing" ? "M183 472 Q205 488 227 472"
    : "M188 478 Q205 482 222 478";

  const purpleMouth =
    mode === "error" ? "M275 215 Q290 200 305 215"
    : mode === "success" ? "M275 210 Q290 225 305 210"
    : "M273 213 h34";

  const yellowMouth =
    mode === "error" ? "M455 360 Q470 348 485 360"
    : mode === "success" ? "M455 355 Q470 370 485 355"
    : "M450 358 h40";

  const hidden = mode === "hidden";

  // ── Eye renderer ─────────────────────────────────────────────────────────
  const renderEye = (
    i: number, cx: number, cy: number, r: number, isSolid: boolean
  ) => {
    const size = r * 1.8;
    if (hidden) {
      return (
        <path
          key={i}
          ref={el => { eyeGroupRefs.current[i] = el; }}
          d={`M ${cx - size} ${cy} Q ${cx} ${cy + size * 0.8} ${cx + size} ${cy}`}
          stroke="#111"
          strokeWidth={Math.max(2.5, size * 0.25)}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    if (isSolid) {
      return (
        <circle
          key={i}
          ref={el => { eyeGroupRefs.current[i] = el as unknown as SVGGElement; }}
          cx={cx}
          cy={cy}
          r={size * 0.7}
          fill="#111"
        />
      );
    }
    return (
      <g key={i} ref={el => { eyeGroupRefs.current[i] = el; }}>
        <circle cx={cx} cy={cy} r={size} fill="#fff" />
        <circle
          ref={el => { pupilRefs.current[i] = el; }}
          cx={cx}
          cy={cy}
          r={size * 0.45}
          fill="#111"
        />
      </g>
    );
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className="w-full max-w-[520px] h-auto select-none"
      aria-hidden="true"
    >
      <ellipse cx="300" cy="555" rx="220" ry="10" fill="rgba(0,0,0,0.06)" />

      {/* PURPLE */}
      <g ref={purpleBodyRef}>
        <rect x="220" y="150" width="140" height="370" rx="14" fill="#5B2EE5" />
        {renderEye(0, 258, 195, 7, false)}
        {renderEye(1, 322, 195, 7, false)}
        <path
          d={purpleMouth}
          stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none"
          style={{ transition: "d 350ms ease" }}
        />
      </g>

      {/* BLACK */}
      <g ref={blackBodyRef}>
        <rect x="340" y="260" width="100" height="270" rx="12" fill="#1A1A1A" />
        {renderEye(2, 368, 305, 6, false)}
        {renderEye(3, 412, 305, 6, false)}
      </g>

      {/* YELLOW */}
      <g ref={yellowBodyRef}>
        <path d="M420 530 V400 a50 50 0 0 1 100 0 V530 Z" fill="#F2C400" />
        {renderEye(4, 470, 355, 5, false)}
        <path
          d={yellowMouth}
          stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none"
          style={{ transition: "d 350ms ease" }}
        />
      </g>

      {/* ORANGE */}
      <g ref={orangeBodyRef}>
        <path d="M80 530 a125 125 0 0 1 250 0 Z" fill="#F58A2E" />
        {renderEye(5, 175, 450, 8, true)}
        {renderEye(6, 235, 450, 8, true)}
        <path
          d={orangeMouth}
          stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none"
          style={{ transition: "d 350ms ease" }}
        />
      </g>
    </svg>
  );
}
