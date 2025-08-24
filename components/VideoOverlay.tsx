"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  leftSrc?: string | null;
  rightSrc?: string | null;
  overlayMode?: boolean;
  overlayOpacity?: number;
  showGuides?: boolean;
  swingAngleDeg?: number;
};

function drawGuides(
  canvas: HTMLCanvasElement,
  angleDeg: number,
  opacity = 0.9
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  // Dim background slightly so guides pop
  ctx.save();
  ctx.globalAlpha = 0.00001; // keep transparent, just to ensure canvas "clears" on iOS
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.lineWidth = Math.max(2, Math.round(width * 0.003));
  ctx.strokeStyle = "rgba(0,0,0,0.6)"; // outer glow via multiple strokes

  // Vertical reference line (target line) in center
  const cx = width * 0.5;

  // Draw a noisy outer to create pseudo glow
  for (let i = 4; i >= 1; i--) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${opacity * (0.15 + i * 0.12)})`;
    ctx.lineWidth = Math.max(2, Math.round(width * 0.003) + i);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();
  }

  // Swing plane line from "ball" (bottom-center) at angle
  const rad = (angleDeg * Math.PI) / 180;
  const bx = cx;
  const by = height * 0.92; // near bottom
  const len = Math.hypot(width, height);

  const ex = bx + Math.cos(-rad) * len;
  const ey = by + Math.sin(-rad) * len;

  for (let i = 4; i >= 1; i--) {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(0,200,255,${opacity * (0.15 + i * 0.12)})`;
    ctx.lineWidth = Math.max(2, Math.round(width * 0.003) + i);
    ctx.moveTo(bx, by);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // "Ball" marker
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.arc(bx, by, Math.max(3, width * 0.008), 0, Math.PI * 2);
  ctx.fill();
}

export default function VideoOverlay({
  leftSrc,
  rightSrc,
  overlayMode = false,
  overlayOpacity = 0.5,
  showGuides = true,
  swingAngleDeg = 40,
}: Props) {
  const leftRef = useRef<HTMLVideoElement | null>(null);
  const rightRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);

  // Keep sizes responsive for canvas
  useEffect(() => {
    function resize() {
      const el = containerRef.current;
      const cvs = canvasRef.current;
      if (!el || !cvs) return;
      const rect = el.getBoundingClientRect();
      cvs.width = Math.floor(rect.width);
      cvs.height = Math.floor(rect.height);
      if (showGuides) drawGuides(cvs, swingAngleDeg);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [showGuides, swingAngleDeg]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (cvs && showGuides) drawGuides(cvs, swingAngleDeg);
  }, [showGuides, swingAngleDeg]);

  // Sync durations and time updates
  useEffect(() => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;

    const onLoaded = () => {
      const d = Math.max(l.duration || 0, r.duration || 0);
      if (isFinite(d)) setDuration(d);
    };

    const onTime = () => {
      // Pick left as source of truth
      setTime(l.currentTime || 0);
      // Soft sync right to left when drift is >100ms
      if (Math.abs((r.currentTime || 0) - (l.currentTime || 0)) > 0.12) {
        r.currentTime = l.currentTime || 0;
      }
    };

    l.addEventListener("loadedmetadata", onLoaded);
    r.addEventListener("loadedmetadata", onLoaded);
    l.addEventListener("timeupdate", onTime);

    return () => {
      l.removeEventListener("loadedmetadata", onLoaded);
      r.removeEventListener("loadedmetadata", onLoaded);
      l.removeEventListener("timeupdate", onTime);
    };
  }, [leftSrc, rightSrc]);

  const playPause = () => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;

    if (playing) {
      l.pause();
      r.pause();
      setPlaying(false);
    } else {
      l.play();
      r.play();
      setPlaying(true);
    }
  };

  const scrub = (t: number) => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;
    l.currentTime = r.currentTime = t;
    setTime(t);
  };

  const setPlaybackRate = (v: number) => {
    const l = leftRef.current;
    const r = rightRef.current;
    if (!l || !r) return;
    l.playbackRate = r.playbackRate = v;
    setRate(v);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
        <button
          onClick={playPause}
          className="rounded bg-black px-3 py-1 text-white"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rate</span>
          <input
            type="range"
            min={0.25}
            max={2}
            step={0.25}
            value={rate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          />
          <span className="text-sm tabular-nums">{rate.toFixed(2)}x</span>
        </div>

        <div className="flex grow items-center gap-2">
          <span className="text-xs text-gray-600 w-14 tabular-nums">
            {time.toFixed(2)}s
          </span>
          <input
            className="grow"
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={time}
            onChange={(e) => scrub(parseFloat(e.target.value))}
          />
          <span className="text-xs text-gray-600 w-14 tabular-nums">
            {(duration || 0).toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Viewer */}
      {overlayMode ? (
        <div
          ref={containerRef}
          className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black"
        >
          <video
            ref={leftRef}
            src={leftSrc || undefined}
            className="absolute left-0 top-0 h-full w-full object-contain"
            playsInline
            controls={false}
          />
          <video
            ref={rightRef}
            src={rightSrc || undefined}
            className="absolute left-0 top-0 h-full w-full object-contain"
            style={{ opacity: overlayOpacity }}
            playsInline
            controls={false}
          />
          {showGuides && (
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div
            ref={containerRef}
            className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black"
          >
            <video
              ref={leftRef}
              src={leftSrc || undefined}
              className="h-full w-full object-contain"
              playsInline
              controls={false}
            />
            {showGuides && (
              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute left-0 top-0 h-full w-full"
              />
            )}
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
            <video
              ref={rightRef}
              src={rightSrc || undefined}
              className="h-full w-full object-contain"
              playsInline
              controls={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
