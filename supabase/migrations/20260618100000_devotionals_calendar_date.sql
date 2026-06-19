-- Add calendar date columns to devotionals for annual rotation.
-- cal_month: 1-12 (January=1 … December=12)
-- cal_day:   1-31
-- Unique constraint ensures at most one devotional per (month, day).

alter table devotionals
  add column if not exists cal_month smallint check (cal_month between 1 and 12),
  add column if not exists cal_day   smallint check (cal_day   between 1 and 31);

create unique index if not exists devotionals_cal_month_day_unique
  on devotionals (cal_month, cal_day);
