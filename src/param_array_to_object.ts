export function paramArrayToObject(p: string[][]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const e of p) {
    r[e[0]] = e[1];
  }
  return r;
}
