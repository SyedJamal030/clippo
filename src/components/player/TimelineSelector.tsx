import { useCallback, useEffect, useRef } from "react";
import ThumbnailStrip from "./ThumbnailStrip";
import { clamp } from "./util/time";

interface TimelineSelectorProps {
  videoFile: Blob | null;
  videoUrl: string;
  duration: number;
  startTime: number;
  endTime: number;
  currentTime?: number;
  onChange: (start: number, end: number) => void;
  onScrub?: (time: number) => void;
  minGap?: number;
}

type DragTarget = "start" | "end" | "range" | null;

export default function TimelineSelector({
  videoFile,
  videoUrl,
  duration,
  startTime,
  endTime,
  currentTime = 0,
  onChange,
  onScrub,
  minGap = 0.05,
}: TimelineSelectorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const leftOverlayRef = useRef<HTMLDivElement>(null);
  const rightOverlayRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const startHandleRef = useRef<HTMLDivElement>(null);
  const endHandleRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  const valuesRef = useRef({
    start: startTime,
    end: endTime,
    current: currentTime,
  });

  const dragRef = useRef<{
    isDragging: boolean;
    type: DragTarget;
    startX: number;
    startValMin: number;
    startValMax: number;
  }>({
    isDragging: false,
    type: null,
    startX: 0,
    startValMin: 0,
    startValMax: 0,
  });

  const syncDOM = useCallback(
    (start: number, end: number, current: number) => {
      if (!trackRef.current || duration <= 0) return;

      const startPct = clamp((start / duration) * 100, 0, 100);
      const endPct = clamp((end / duration) * 100, 0, 100);
      const playheadPct = clamp((current / duration) * 100, 0, 100);

      if (leftOverlayRef.current)
        leftOverlayRef.current.style.width = `${startPct}%`;
      if (rightOverlayRef.current)
        rightOverlayRef.current.style.width = `${100 - endPct}%`;

      if (rangeRef.current) {
        rangeRef.current.style.left = `${startPct}%`;
        rangeRef.current.style.width = `${Math.max(0, endPct - startPct)}%`;
      }

      if (startHandleRef.current) {
        startHandleRef.current.style.left = `${startPct}%`;
        startHandleRef.current.setAttribute("aria-valuenow", start.toFixed(2));
      }

      if (endHandleRef.current) {
        endHandleRef.current.style.left = `${endPct}%`;
        endHandleRef.current.setAttribute("aria-valuenow", end.toFixed(2));
      }

      if (playheadRef.current) {
        playheadRef.current.style.left = `${playheadPct}%`;
      }
    },
    [duration],
  );

  useEffect(() => {
    if (!dragRef.current.isDragging) {
      valuesRef.current = {
        start: startTime,
        end: endTime,
        current: currentTime,
      };
      syncDOM(startTime, endTime, currentTime);
    }
  }, [startTime, endTime, currentTime, syncDOM]);

  const handlePointerDown = useCallback(
    (type: DragTarget) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      dragRef.current = {
        isDragging: true,
        type,
        startX: e.clientX,
        startValMin: valuesRef.current.start,
        startValMax: valuesRef.current.end,
      };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging || !trackRef.current) return;

      const { type, startX, startValMin, startValMax } = dragRef.current;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width === 0) return;

      const dx = e.clientX - startX;
      const deltaTime = (dx / rect.width) * duration;

      let newStart = valuesRef.current.start;
      let newEnd = valuesRef.current.end;
      let newCurrent = valuesRef.current.current;

      if (type === "start") {
        newStart = clamp(startValMin + deltaTime, 0, startValMax - minGap);
        newCurrent = newStart;
        onScrub?.(newStart);
        onChange(newStart, newEnd);
      } else if (type === "end") {
        newEnd = clamp(startValMax + deltaTime, startValMin + minGap, duration);
        newCurrent = newEnd; // Move playhead to end handle for preview
        onScrub?.(newEnd); // Scrub video to end frame
        onChange(newStart, newEnd);
      } else if (type === "range") {
        const span = startValMax - startValMin;
        newStart = clamp(startValMin + deltaTime, 0, duration - span);
        newEnd = newStart + span;
        newCurrent = newStart;
        onScrub?.(newStart);
        onChange(newStart, newEnd);
      }

      valuesRef.current = { start: newStart, end: newEnd, current: newCurrent };
      syncDOM(newStart, newEnd, newCurrent);
    },
    [duration, minGap, onChange, onScrub, syncDOM],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (er) {
        console.warn(er);        
      }

      const previousType = dragRef.current.type;

      dragRef.current.isDragging = false;
      dragRef.current.type = null;

      // When dragging end handle finishes, move playhead & video preview back to start handle
      if (previousType === "end") {
        const startVal = valuesRef.current.start;
        valuesRef.current.current = startVal;
        onScrub?.(startVal);
        syncDOM(startVal, valuesRef.current.end, startVal);
      }

      onChange(valuesRef.current.start, valuesRef.current.end);
    },
    [onChange, onScrub, syncDOM],
  );

  return (
    <div className="relative w-full select-none touch-none py-1">
      <div
        ref={trackRef}
        className="relative h-14 w-full rounded-lg bg-base-300 border border-base-content/15 flex items-center cursor-default"
      >
        <ThumbnailStrip videoFile={videoFile} videoUrl={videoUrl} />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-base-content)_1px,transparent_1px)] opacity-10 bg-[size:16px_100%] z-0" />

        <div
          ref={leftOverlayRef}
          className="pointer-events-none absolute inset-y-0 left-0 bg-base-100/70 backdrop-brightness-75 z-10"
        />

        <div
          ref={rightOverlayRef}
          className="pointer-events-none absolute inset-y-0 right-0 bg-base-100/70 backdrop-brightness-75 z-10"
        />

        <div
          ref={rangeRef}
          onPointerDown={handlePointerDown("range")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-y-0 border-y-2 border-primary bg-primary/15 cursor-grab active:cursor-grabbing z-20 box-border"
        />

        <div
          ref={startHandleRef}
          role="slider"
          aria-label="Trim Start Time"
          tabIndex={0}
          onPointerDown={handlePointerDown("start")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-y-0 w-3 -translate-x-1/2 flex items-center justify-center bg-primary rounded-md cursor-ew-resize z-30 shadow-md outline-none"
        >
          <div className="w-0.5 h-5 bg-primary-content/60 rounded-full" />
        </div>

        <div
          ref={endHandleRef}
          role="slider"
          aria-label="Trim End Time"
          tabIndex={0}
          onPointerDown={handlePointerDown("end")}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-y-0 w-3 -translate-x-1/2 flex items-center justify-center bg-primary rounded-md cursor-ew-resize z-30 shadow-md outline-none"
        >
          <div className="w-0.5 h-5 bg-primary-content/60 rounded-full" />
        </div>

        <div
          ref={playheadRef}
          className="pointer-events-none absolute top-0 bottom-0 z-40 flex flex-col items-center -translate-x-1/2"
        >
          <div className="w-2.5 h-2.5 bg-white rotate-45 -top-1 absolute rounded-[1px] shadow-sm" />
          <div className="w-[2px] h-full bg-white shadow-[0_0_8px_var(--color-white)]" />
        </div>
      </div>
    </div>
  );
}
