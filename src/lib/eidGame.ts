/**
 * In-memory store for the Eid game.
 * Falls back to this when Supabase tables don't exist.
 * Persists within a single Node.js process lifetime.
 */

interface Play {
  id: string;
  phone: string;
  ip: string;
  result: "win" | "lose";
  name: string;
  createdAt: string;
}

// Module-level singletons
const memPlays = new Map<string, Play>();
const usedPhones = new Set<string>();
const usedIPs = new Set<string>();
const whitelistPhones = new Set<string>();
const whitelistIPs = new Set<string>();
let winMode = false; // false = lose, true = next player wins (then resets)
let totalWins = 0;
let totalPlays = 0;

// ── Permanent test whitelist ────────────────────────────────────────────────
// Phone 26107128 and its associated IPs are always allowed to replay.
whitelistPhones.add("26107128");

/** Whitelisted phones/IPs bypass blocking and are never recorded as used. */
export function memAddWhitelist(phone?: string, ip?: string) {
  if (phone) whitelistPhones.add(phone);
  if (ip) whitelistIPs.add(ip);
}

export function memCheckEligible(phone: string, ip: string): { eligible: boolean; reason?: string } {
  if (whitelistPhones.has(phone) || whitelistIPs.has(ip)) return { eligible: true };
  if (usedPhones.has(phone)) return { eligible: false, reason: "phone" };
  if (usedIPs.has(ip)) return { eligible: false, reason: "ip" };
  return { eligible: true };
}

export function memRecordPlay(phone: string, ip: string, name: string): "win" | "lose" {
  const result: "win" | "lose" = winMode ? "win" : "lose";
  if (winMode) {
    winMode = false; // auto-reset after one win
    totalWins++;
  }
  totalPlays++;
  const play: Play = {
    id: crypto.randomUUID(),
    phone,
    ip,
    result,
    name,
    createdAt: new Date().toISOString(),
  };
  memPlays.set(play.id, play);
  // Whitelisted entries can replay — don't mark as used
  if (!whitelistPhones.has(phone)) usedPhones.add(phone);
  if (!whitelistIPs.has(ip)) usedIPs.add(ip);
  return result;
}

export function memGetConfig() {
  return { winMode, totalWins, totalPlays };
}

export function memSetWinMode(value: boolean) {
  winMode = value;
}

export function memGetPlays(): Play[] {
  return Array.from(memPlays.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function memClearPlays() {
  memPlays.clear();
  usedPhones.clear();
  usedIPs.clear();
  totalWins = 0;
  totalPlays = 0;
}
