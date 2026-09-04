import { useCallback, useEffect, useState } from 'react';
import { formatTime, parseTime, clamp } from './util/time';
import { MoveRightIcon, ScissorsLineDashedIcon } from 'lucide-react';

interface TimeInputsProps {
  startTime: number;
  endTime: number;
  duration: number;
  minGap?: number;
  onChange: (start: number, end: number) => void;
  onSeek?: (time: number) => void;
}

export default function TimeInputs({
  startTime,
  endTime,
  duration,
  minGap = 0.05,
  onChange,
  onSeek,
}: TimeInputsProps) {
  const useHours = duration >= 3600;
  const [startText, setStartText] = useState(formatTime(startTime, useHours));
  const [endText, setEndText] = useState(formatTime(endTime, useHours));

  useEffect(() => {
    setStartText(formatTime(startTime, useHours));
  }, [startTime, useHours]);

  useEffect(() => {
    setEndText(formatTime(endTime, useHours));
  }, [endTime, useHours]);

  const commitStart = useCallback(() => {
    const parsed = parseTime(startText);
    if (parsed === null) {
      setStartText(formatTime(startTime, useHours));
      return;
    }
    const next = clamp(parsed, 0, endTime - minGap);
    onChange(next, endTime);
    onSeek?.(next);
    setStartText(formatTime(next, useHours));
  }, [endTime, minGap, onChange, onSeek, startText, startTime, useHours]);

  const commitEnd = useCallback(() => {
    const parsed = parseTime(endText);
    if (parsed === null) {
      setEndText(formatTime(endTime, useHours));
      return;
    }
    const next = clamp(parsed, startTime + minGap, duration);
    onChange(startTime, next);
    onSeek?.(next);
    setEndText(formatTime(next, useHours));
  }, [duration, endText, endTime, minGap, onChange, onSeek, startTime, useHours]);

  const durationText = formatTime(endTime - startTime, useHours);

  return (
    <div className="w-full bg-base-200/50 border border-base-300 rounded-xl p-2.5 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Trim Controls Group */}
        <div className="flex items-center gap-2 grow sm:grow-0">
          {/* Start Field */}
          <label
            htmlFor="startTime"
            className="input md:input-sm border border-base-300 bg-base-100 focus-within:border-primary focus-within:outline-none flex items-center justify-between gap-2 rounded-lg px-2.5 transition-colors grow sm:grow-0 min-w-0"
          >
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider shrink-0">
              Start
            </span>
            <input
              type="text"
              name="startTime"
              inputMode="decimal"
              className="w-20 font-mono text-xs tracking-wider text-right bg-transparent focus:outline-none text-base-content min-w-0"
              value={startText}
              onChange={(e) => setStartText(e.target.value)}
              onBlur={commitStart}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </label>

          <MoveRightIcon className="text-base-content/30 shrink-0 size-3" />

          {/* End Field */}
          <label
            htmlFor="endTime"
            className="input md:input-sm border border-base-300 bg-base-100 focus-within:border-primary focus-within:outline-none flex items-center justify-between gap-2 rounded-lg px-2.5 transition-colors grow sm:grow-0 min-w-0"
          >
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider shrink-0">
              End
            </span>
            <input
              type="text"
              name="endTime"
              inputMode="decimal"
              className="w-20 font-mono text-xs tracking-wider text-right bg-transparent focus:outline-none text-base-content min-w-0"
              value={endText}
              onChange={(e) => setEndText(e.target.value)}
              onBlur={commitEnd}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </label>
        </div>

        {/* Right: Duration Stats (Clip vs Total) */}
        <div className="items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 border-base-300/50 pt-2 sm:pt-0 sm:flex hidden">
          {/* Selected Trimmed Duration */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
            <ScissorsLineDashedIcon className="size-4" />
            <span className="font-bold">{durationText}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex sm:hidden items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border border-primary/30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center size-6 rounded-md bg-primary text-primary-content text-xs font-bold">
            <ScissorsLineDashedIcon className="size-4" />
          </span>
          <span className="text-xs font-bold tracking-wide uppercase text-base-content/80">
            Clip Length
          </span>
        </div>

        <div className="font-mono text-base font-black text-primary tracking-tight">
          {formatTime(endTime - startTime, useHours)}
        </div>
      </div>
    </div>
  );
}
