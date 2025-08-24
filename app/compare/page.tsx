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
        Load a <strong>user</strong> video and a <strong>reference</strong> video. Toggle
        overlay to superimpose; adjust opacity and swing-plane guides. Everything runs locally—no uploads.
      </p>
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
