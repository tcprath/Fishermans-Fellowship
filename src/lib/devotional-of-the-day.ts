import { toZonedTime } from "date-fns-tz";

const TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";

type CalEntry = { id: string; slug: string; cal_month: number | null; cal_day: number | null };

function calKey(month: number, day: number) {
  return month * 100 + day;
}

export function pickOfTheDay<T extends CalEntry>(catalog: T[], now = new Date()): T | null {
  const dated = catalog.filter((d) => d.cal_month != null && d.cal_day != null);
  if (!dated.length) return null;

  const z = toZonedTime(now, TZ);
  const todayKey = calKey(z.getMonth() + 1, z.getDate());

  // Exact match first
  const exact = dated.find((d) => calKey(d.cal_month!, d.cal_day!) === todayKey);
  if (exact) return exact;

  // Greatest (cal_month, cal_day) <= today
  const before = dated.filter((d) => calKey(d.cal_month!, d.cal_day!) < todayKey);
  if (before.length) {
    return before.reduce((a, b) =>
      calKey(a.cal_month!, a.cal_day!) >= calKey(b.cal_month!, b.cal_day!) ? a : b
    );
  }

  // Wrap: greatest overall (Dec 31 side)
  return dated.reduce((a, b) =>
    calKey(a.cal_month!, a.cal_day!) >= calKey(b.cal_month!, b.cal_day!) ? a : b
  );
}
