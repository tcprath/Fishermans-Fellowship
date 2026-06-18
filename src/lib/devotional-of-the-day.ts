import { toZonedTime } from "date-fns-tz";

const TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";
const EPOCH_UTC = Date.UTC(2026, 0, 1);

export function pickOfTheDay<T>(catalog: T[], now = new Date()): T | null {
  const n = catalog.length;
  if (!n) return null;
  const z = toZonedTime(now, TZ);
  const day = Math.floor(
    (Date.UTC(z.getFullYear(), z.getMonth(), z.getDate()) - EPOCH_UTC) /
      86_400_000
  );
  return catalog[((day % n) + n) % n];
}
