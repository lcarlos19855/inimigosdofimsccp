export function searchParamOne(
  v: string | string[] | undefined
): string | undefined {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v[0];
  return v;
}
