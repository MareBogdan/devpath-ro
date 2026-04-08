// ─── Romanian Holiday Helpers ─────────────────────────────────────────────────
// Pure helper functions — no "use server" needed

export function getOrthodoxEasterMonday(year: number): Date {
  // Meeus/Jones/Butcher algorithm for Julian calendar → Gregorian (+13 days)
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=March, 4=April
  const day = ((d + e + 114) % 31) + 1;
  // Julian → Gregorian: +13 days; then +1 for Easter Monday
  return new Date(year, month - 1, day + 13 + 1);
}

export function isRomanianHoliday(date: Date): boolean {
  const bucStr = date.toLocaleString("en-US", { timeZone: "Europe/Bucharest" });
  const buc = new Date(bucStr);
  const month = buc.getMonth() + 1;
  const day = buc.getDate();
  const year = buc.getFullYear();

  const fixed = [
    [1, 1], [1, 2], [1, 24], [5, 1], [6, 1],
    [8, 15], [11, 30], [12, 1], [12, 25], [12, 26],
  ];
  if (fixed.some(([m, d2]) => m === month && d2 === day)) return true;

  const easterMonday = getOrthodoxEasterMonday(year);
  if (
    easterMonday.getMonth() + 1 === month &&
    easterMonday.getDate() === day
  )
    return true;

  return false;
}
