export function getSaleCountdown(now: number, startsAt: string, endsAt: string) {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  const phase = now < start ? "upcoming" : now < end ? "active" : "ended";
  const remaining = Math.max(0, Math.ceil(((phase === "upcoming" ? start : end) - now) / 1000));
  return {
    phase,
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining / 3600) % 24,
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60,
  } as const;
}
