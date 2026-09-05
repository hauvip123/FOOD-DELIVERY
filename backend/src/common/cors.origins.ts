export function getCorsOrigins() {
  const configured = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  const origins = configured
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  for (const local of ['http://localhost:3001', 'http://127.0.0.1:3001']) {
    if (!origins.includes(local)) {
      origins.push(local);
    }
  }

  return origins;
}
