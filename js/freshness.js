// Kereskedési ablak: Europe/Budapest, H-P 09:00–22:30 (a végpont is benne van).
const DAYS = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export function isTradingWindow(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = DAYS[get("weekday")];
  if (day > 5) return false;
  const mins = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
  return mins >= 9 * 60 && mins <= 22 * 60 + 30;
}

export function isStale(updatedIso, now, maxSec = 3600) {
  if (!isTradingWindow(now)) return false;
  if (!updatedIso) return true;
  const t = Date.parse(updatedIso);
  if (Number.isNaN(t)) return true;
  return (now.getTime() - t) / 1000 > maxSec;
}
