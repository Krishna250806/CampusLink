/**
 * Converts an ISO date string (UTC) to a local "YYYY-MM-DDTHH:mm" string
 * suitable for HTML <input type="datetime-local">.
 */
export function isoToDatetimeLocal(isoStr?: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Safely parses a local "YYYY-MM-DDTHH:mm" datetime string from <input type="datetime-local">
 * and returns a standard ISO UTC string. Returns current ISO string on invalid input.
 */
export function datetimeLocalToIso(localStr: string, fallbackDaysFromNow = 14): string {
  if (!localStr) {
    return new Date(Date.now() + 86400000 * fallbackDaysFromNow).toISOString();
  }
  const d = new Date(localStr);
  if (isNaN(d.getTime())) {
    return new Date(Date.now() + 86400000 * fallbackDaysFromNow).toISOString();
  }
  return d.toISOString();
}
