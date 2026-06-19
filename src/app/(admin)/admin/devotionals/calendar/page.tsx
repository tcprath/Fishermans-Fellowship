import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toZonedTime } from "date-fns-tz";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Devotional Calendar" };
export const revalidate = 0;

const TZ = process.env.NEXT_PUBLIC_SITE_TZ ?? "America/New_York";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

type DevotionalSlot = {
  id: string;
  title: string;
  status: "draft" | "published";
};

export default async function DevotionalCalendarPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("devotionals")
    .select("id, title, status, cal_month, cal_day")
    .not("cal_month", "is", null)
    .not("cal_day", "is", null)
    .order("cal_month", { ascending: true })
    .order("cal_day", { ascending: true });

  // Build lookup: "month-day" → devotional
  const slotMap = new Map<string, DevotionalSlot>();
  for (const row of rows ?? []) {
    if (row.cal_month && row.cal_day) {
      slotMap.set(`${row.cal_month}-${row.cal_day}`, {
        id: row.id,
        title: row.title,
        status: row.status,
      });
    }
  }

  const now = toZonedTime(new Date(), TZ);
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const assigned = slotMap.size;
  const total = DAYS_IN_MONTH.reduce((a, b) => a + b, 0); // 366 (Feb has 29)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/devotionals"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Devotionals
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-bold">Year at a Glance</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        {assigned} of {total} days assigned
        {assigned < total && ` · ${total - assigned} gaps`}
      </p>

      <div className="space-y-8">
        {MONTHS.map((monthName, mi) => {
          const month = mi + 1;
          const days = DAYS_IN_MONTH[mi];

          return (
            <div key={month}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {monthName}
              </h2>
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-1.5"
                style={{ "--cols": "14" } as React.CSSProperties}>
                {Array.from({ length: days }, (_, di) => {
                  const day = di + 1;
                  const key = `${month}-${day}`;
                  const slot = slotMap.get(key);
                  const isToday = month === todayMonth && day === todayDay;

                  if (slot) {
                    return (
                      <Link
                        key={day}
                        href={`/admin/devotionals/${slot.id}`}
                        title={slot.title}
                        className={`
                          group relative flex flex-col items-center justify-center rounded-lg border text-center
                          aspect-square text-xs font-medium transition-all
                          ${isToday
                            ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-1"
                            : slot.status === "published"
                              ? "border-green-200 bg-green-50 text-green-800 hover:border-green-400 hover:bg-green-100"
                              : "border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100"
                          }
                        `}
                      >
                        <span className="text-[10px] leading-none mb-0.5 font-bold">{day}</span>
                        <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-foreground text-background text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10 max-w-[160px] truncate pointer-events-none">
                          {slot.title}
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={day}
                      href={`/admin/devotionals/new?cal_month=${month}&cal_day=${day}`}
                      title={`Create devotional for ${monthName} ${day}`}
                      className={`
                        flex items-center justify-center rounded-lg border aspect-square text-xs transition-all
                        ${isToday
                          ? "border-primary/40 bg-primary/10 text-primary font-bold ring-2 ring-primary ring-offset-1"
                          : "border-dashed border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground hover:bg-muted"
                        }
                      `}
                    >
                      {day}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-200" />
          Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-amber-100 border border-amber-200" />
          Draft
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded border-dashed border border-border" />
          Empty (click to create)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-primary border border-primary" />
          Today
        </span>
      </div>
    </div>
  );
}
