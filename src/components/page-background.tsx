"use client";

import * as React from "react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Sahifa foni — bog'langan nuqtalar tarmog'i.
 *
 * MUHIM: animatsiya sikli bir marta ishga tushadi va mavzu o'zgarganda
 * QAYTA ISHGA TUSHMAYDI. Ranglar ref orqali yangilanadi, nuqtalar esa
 * joyida qoladi. Ilgari mavzu almashganda butun canvas qayta quriladi,
 * nuqtalar sakrab ketardi va o'tish sekin ko'rinardi.
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Palette {
  dot: string;
  link: string;
  dotAlpha: number;
  linkAlpha: number;
}

const PALETTES: Record<"light" | "dark", Palette> = {
  light: { dot: "27, 90, 170", link: "40, 100, 190", dotAlpha: 0.32, linkAlpha: 0.18 },
  dark: { dot: "150, 190, 255", link: "130, 175, 255", dotAlpha: 0.46, linkAlpha: 0.24 },
};

/** Ekran maydoniga qarab nechta nuqta chizilishini hisoblaydi. */
function nodeCount(width: number, height: number): number {
  const byArea = Math.round((width * height) / 22000);
  return Math.max(28, Math.min(90, byArea));
}

export function PageBackground({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const paletteRef = React.useRef<Palette>(PALETTES.light);
  const { resolvedTheme } = useTheme();

  // Mavzu o'zgarsa — faqat ranglarni almashtiramiz, sikl to'xtamaydi.
  React.useEffect(() => {
    paletteRef.current = PALETTES[resolvedTheme];
  }, [resolvedTheme]);

  // Bu effekt bir marta ishlaydi: bo'sh bog'liqlik ro'yxati ataylab.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const cv = canvas;
    const ctx = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    let running = true;

    const pointer = { x: -9999, y: -9999 };

    function seed() {
      nodes = Array.from({ length: nodeCount(width, height) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.5 + 1,
      }));
    }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;

      // Balandlik mobil brauzerlarda skroll paytida o'zgaradi —
      // arzimas farqda qayta qurmaymiz.
      const sameSize = Math.abs(nextWidth - width) < 2 && Math.abs(nextHeight - height) < 120;

      width = nextWidth;
      height = nextHeight;

      cv.width = width * ratio;
      cv.height = height * ratio;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (!sameSize || nodes.length === 0) seed();
    }

    function draw() {
      const { dot, link, dotAlpha, linkAlpha } = paletteRef.current;

      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        if (!reduceMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
        const glow = distance < 160 ? 1 - distance / 160 : 0;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + glow * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot}, ${dotAlpha + glow * 0.45})`;
        ctx.fill();
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance > 150) continue;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${link}, ${(1 - distance / 150) * linkAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (running) frame = window.requestAnimationFrame(draw);
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    function onPointerLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        window.cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = window.requestAnimationFrame(draw);
      }
    }

    resize();
    frame = window.requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className={cn("kpk-bg", className)} aria-hidden>
      <canvas ref={canvasRef} className="kpk-canvas" />
      <div className="kpk-vignette" />
    </div>
  );
}