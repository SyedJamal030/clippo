export function formatTime(seconds: number, forceHours = false): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;

  const totalMs = Math.round(seconds * 1000);
  const ms = Math.floor((totalMs % 1000) / 10);
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");

  if (h > 0 || forceHours) {
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms)}`;
  }
  return `${pad(m)}:${pad(s)}.${pad(ms)}`;
}

export function parseTime(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(":");
  if (parts.length > 3) return null;

  const parsedParts = parts.map((p) => Number(p));
  if (parsedParts.some((n) => Number.isNaN(n) || n < 0)) return null;

  let hours = 0;
  let minutes = 0;
  let secs = 0;

  if (parsedParts.length === 3) {
    [hours, minutes, secs] = parsedParts;
  } else if (parsedParts.length === 2) {
    [minutes, secs] = parsedParts;
  } else {
    [secs] = parsedParts;
  }

  if (minutes >= 60 || secs >= 60) return null;

  return hours * 3600 + minutes * 60 + secs;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
