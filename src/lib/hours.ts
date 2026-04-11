export interface TenantHoursRow {
  id: string;
  tenantId: string;
  dayOfWeek: number;
  shift: number;
  opensAt: string;
  closesAt: string;
}

export interface TenantExceptionRow {
  id: string;
  tenantId: string;
  date: string;
  closed: boolean;
  note: string | null;
}

export interface IsOpenResult {
  open: boolean;
  currentShift: TenantHoursRow | null;
  closesAt: Date | null;
  nextOpensAt: Date | null;
  reason: 'open' | 'closed_regular' | 'closed_exception' | 'no_hours_configured';
  exceptionNote: string | null;
}

const DEFAULT_TZ = 'America/Sao_Paulo';
const DAY_ABBR_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
  isoDate: string;
}

function getLocalParts(d: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(d);

  const lookup: Record<string, string> = {};
  for (const p of parts) lookup[p.type] = p.value;

  const hourRaw = lookup.hour === '24' ? '00' : lookup.hour;
  const year = Number(lookup.year);
  const month = Number(lookup.month);
  const day = Number(lookup.day);
  const isoDate = `${lookup.year}-${lookup.month}-${lookup.day}`;

  return {
    year,
    month,
    day,
    hour: Number(hourRaw),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
    dayOfWeek: WEEKDAY_MAP[lookup.weekday] ?? 0,
    isoDate,
  };
}

function parseHHMMSS(s: string): number {
  const [h, m, sec] = s.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (sec || 0);
}

function formatHourShort(s: string): string {
  const [hStr, mStr] = s.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (m === 0) return `${h}h`;
  return `${h}h${mStr.padStart(2, '0')}`;
}

// Why: Given timezone-local Y/M/D/H/M/S, build a real UTC Date by probing the
// zone offset at that approximate instant. Two passes handle DST edge cases.
function zonedTimeToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset1 = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  const adjusted1 = utcGuess - offset1;
  const offset2 = getTimeZoneOffsetMs(new Date(adjusted1), timeZone);
  return new Date(utcGuess - offset2);
}

function getTimeZoneOffsetMs(d: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const lookup: Record<string, string> = {};
  for (const p of parts) lookup[p.type] = p.value;
  const hour = lookup.hour === '24' ? '00' : lookup.hour;
  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(hour),
    Number(lookup.minute),
    Number(lookup.second),
  );
  return asUtc - d.getTime();
}

function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const next = new Date(utc + days * 86400000);
  const yy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(next.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function dayOfWeekFromIso(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function secondsToHMS(sec: number): { h: number; m: number; s: number } {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return { h, m, s };
}

interface ShiftCandidate {
  row: TenantHoursRow;
  opensSec: number;
  closesSec: number;
  crossesMidnight: boolean;
}

function toCandidates(rows: TenantHoursRow[]): ShiftCandidate[] {
  return rows.map((row) => {
    const opensSec = parseHHMMSS(row.opensAt);
    const closesSec = parseHHMMSS(row.closesAt);
    return {
      row,
      opensSec,
      closesSec,
      crossesMidnight: closesSec <= opensSec,
    };
  });
}

function findNextOpening(
  hours: TenantHoursRow[],
  exceptions: TenantExceptionRow[],
  startIso: string,
  startSec: number,
  timeZone: string,
): { row: TenantHoursRow; date: Date } | null {
  const byDow = new Map<number, ShiftCandidate[]>();
  for (const c of toCandidates(hours)) {
    const arr = byDow.get(c.row.dayOfWeek) ?? [];
    arr.push(c);
    byDow.set(c.row.dayOfWeek, arr);
  }
  for (const arr of byDow.values()) arr.sort((a, b) => a.opensSec - b.opensSec);

  const excByDate = new Map<string, TenantExceptionRow>();
  for (const e of exceptions) excByDate.set(e.date, e);

  for (let offset = 0; offset < 14; offset++) {
    const iso = addDaysIso(startIso, offset);
    const exc = excByDate.get(iso);
    if (exc?.closed) continue;
    const dow = dayOfWeekFromIso(iso);
    const shifts = byDow.get(dow);
    if (!shifts || shifts.length === 0) continue;
    for (const c of shifts) {
      if (offset === 0 && c.opensSec <= startSec) continue;
      const { h, m, s } = secondsToHMS(c.opensSec);
      const [y, mo, d] = iso.split('-').map(Number);
      return { row: c.row, date: zonedTimeToDate(y, mo, d, h, m, s, timeZone) };
    }
  }
  return null;
}

export function isOpenNow(
  hours: TenantHoursRow[],
  exceptions: TenantExceptionRow[],
  now: Date = new Date(),
  timeZone: string = DEFAULT_TZ,
): IsOpenResult {
  if (hours.length === 0) {
    return {
      open: false,
      currentShift: null,
      closesAt: null,
      nextOpensAt: null,
      reason: 'no_hours_configured',
      exceptionNote: null,
    };
  }

  const local = getLocalParts(now, timeZone);
  const currentSec = local.hour * 3600 + local.minute * 60 + local.second;

  const excByDate = new Map<string, TenantExceptionRow>();
  for (const e of exceptions) excByDate.set(e.date, e);

  const todayExc = excByDate.get(local.isoDate);
  const yesterdayIso = addDaysIso(local.isoDate, -1);
  const yesterdayExc = excByDate.get(yesterdayIso);

  // Why: a shift that crossed midnight from yesterday may still be active now.
  if (!yesterdayExc?.closed) {
    const yesterdayDow = dayOfWeekFromIso(yesterdayIso);
    const yShifts = toCandidates(hours.filter((h) => h.dayOfWeek === yesterdayDow));
    for (const c of yShifts) {
      if (!c.crossesMidnight) continue;
      if (currentSec < c.closesSec) {
        const [y, mo, d] = local.isoDate.split('-').map(Number);
        const hms = secondsToHMS(c.closesSec);
        const closesAt = zonedTimeToDate(y, mo, d, hms.h, hms.m, hms.s, timeZone);
        return {
          open: true,
          currentShift: c.row,
          closesAt,
          nextOpensAt: null,
          reason: 'open',
          exceptionNote: null,
        };
      }
    }
  }

  if (todayExc?.closed) {
    const next = findNextOpening(
      hours,
      exceptions,
      addDaysIso(local.isoDate, 1),
      0,
      timeZone,
    );
    return {
      open: false,
      currentShift: null,
      closesAt: null,
      nextOpensAt: next?.date ?? null,
      reason: 'closed_exception',
      exceptionNote: todayExc.note,
    };
  }

  const todayShifts = toCandidates(hours.filter((h) => h.dayOfWeek === local.dayOfWeek))
    .sort((a, b) => a.opensSec - b.opensSec);

  for (const c of todayShifts) {
    if (c.crossesMidnight) {
      if (currentSec >= c.opensSec) {
        const nextIso = addDaysIso(local.isoDate, 1);
        const [y, mo, d] = nextIso.split('-').map(Number);
        const hms = secondsToHMS(c.closesSec);
        const closesAt = zonedTimeToDate(y, mo, d, hms.h, hms.m, hms.s, timeZone);
        return {
          open: true,
          currentShift: c.row,
          closesAt,
          nextOpensAt: null,
          reason: 'open',
          exceptionNote: null,
        };
      }
    } else if (currentSec >= c.opensSec && currentSec < c.closesSec) {
      const [y, mo, d] = local.isoDate.split('-').map(Number);
      const hms = secondsToHMS(c.closesSec);
      const closesAt = zonedTimeToDate(y, mo, d, hms.h, hms.m, hms.s, timeZone);
      return {
        open: true,
        currentShift: c.row,
        closesAt,
        nextOpensAt: null,
        reason: 'open',
        exceptionNote: null,
      };
    }
  }

  const next = findNextOpening(hours, exceptions, local.isoDate, currentSec, timeZone);
  return {
    open: false,
    currentShift: null,
    closesAt: null,
    nextOpensAt: next?.date ?? null,
    reason: 'closed_regular',
    exceptionNote: null,
  };
}

export function formatHoursHuman(
  hours: TenantHoursRow[],
  _timeZone: string = DEFAULT_TZ,
): string {
  void _timeZone;
  const byDow: string[] = [];
  for (let dow = 0; dow < 7; dow++) {
    const shifts = hours
      .filter((h) => h.dayOfWeek === dow)
      .sort((a, b) => parseHHMMSS(a.opensAt) - parseHHMMSS(b.opensAt));
    if (shifts.length === 0) {
      byDow.push('fechado');
    } else {
      byDow.push(
        shifts
          .map((s) => `${formatHourShort(s.opensAt)} às ${formatHourShort(s.closesAt)}`)
          .join(', '),
      );
    }
  }

  // Why: group consecutive days (Mon..Sun order is more natural in PT-BR — we
  // iterate 1..6 then 0 so "Seg a Dom" ranges read correctly).
  const order = [1, 2, 3, 4, 5, 6, 0];
  const lines: string[] = [];
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && byDow[order[j + 1]] === byDow[order[i]]) j++;
    const label =
      i === j
        ? DAY_ABBR_PT[order[i]]
        : `${DAY_ABBR_PT[order[i]]} a ${DAY_ABBR_PT[order[j]]}`;
    lines.push(`${label}: ${byDow[order[i]]}`);
    i = j + 1;
  }

  return lines.join('\n');
}
