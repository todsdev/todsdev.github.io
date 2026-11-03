/**
 * Experience periods ("Jan 2025 – Mar 2026", "Aug 2016 – present") with machine-readable
 * `datetime` values. Pure and import-free so it runs under `node --test` (period.test.ts).
 * Dates are read in UTC: content dates are UTC midnight, so local time zones never shift a month.
 */

export interface PeriodEnd {
  text: string;
  /** `YYYY-MM`, or absent for an ongoing position. */
  datetime?: string;
}

export interface Period {
  start: Required<PeriodEnd>;
  end: PeriodEnd;
}

function point(date: Date, months: readonly string[]): Required<PeriodEnd> {
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  return {
    text: `${months[month] ?? ""} ${year}`,
    datetime: `${year}-${String(month + 1).padStart(2, "0")}`,
  };
}

export function formatPeriod(
  start: Date,
  end: Date | undefined,
  months: readonly string[],
  present: string,
): Period {
  return {
    start: point(start, months),
    end: end ? point(end, months) : { text: present },
  };
}
