"use client";
import React, { useMemo, useState } from "react";
import VideoOverlay from "@/components/VideoOverlay";

function useObjectUrl(file: File | null): string | null {
  return useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);
}

export default function ComparePage() {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);

  const [overlayMode, setOverlayMode] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [showGuides, setShowGuides] = useState(true);
  const [swingAngle, setSwingAngle] = useState(40);

  const leftUrl = useObjectUrl(leftFile);
  const rightUrl = useObjectUrl(rightFile);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold">Compare</h1>
      <p className="mt-2 text-sm text-gray-600">
        Load a <strong>user</strong> video and a <strong>reference</strong> video. Toggle overlay to superimpose; adjust opacity and swing-plane guides. Everything runs locally—no uploads.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex w-full cursor-pointer flex-col gap-2 rounded border p-3">
          <span className="text-sm font-medium">User Video</span>
          <input type="file" accept="video/*" onChange={(e) => setLeftFile(e.target.files?.[0] || null)} />
          {leftFile && <span className="text-xs text-gray-600">{leftFile.name}</span>}
        </label>
        <label className="flex w-full cursor-pointer flex-col gap-2 rounded border p-3">
          <span className="text-sm font-medium">Reference Video</span>
          <input type="file" accept="video/*" onChange={(e) => setRightFile(e.target.files?.[0] || null)} />
          {rightFile && <span className="text-xs text-gray-600">{rightFile.name}</span>}
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border p-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={overlayMode} onChange={(e) => setOverlayMode(e.target.checked)} />
          <span className="text-sm">Overlay mode</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
          <span className="text-sm">Show guides</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Overlay opacity</span>
          <input type="range" min={0} max={1} step={0.05} value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} />
          <span className="text-sm tabular-nums">{overlayOpacity.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Swing plane (°)</span>
          <input type="range" min={10} max={70} step={1} value={swingAngle} onChange={(e) => setSwingAngle(parseInt(e.target.value))} />
          <span className="text-sm tabular-nums">{swingAngle}°</span>
        </div>
      </div>

      <div className="mt-4">
        <VideoOverlay
          leftSrc={leftUrl}
          rightSrc={rightUrl}
          overlayMode={overlayMode}
          overlayOpacity={overlayOpacity}
          showGuides={showGuides}
          swingAngleDeg={swingAngle}
        />
      </div>
    </main>
  );
}
