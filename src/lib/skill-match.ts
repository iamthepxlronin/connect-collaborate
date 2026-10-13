/** Rule-based skill match: |user ∩ required| / |required| × 100, rounded. Case-insensitive. */
export function skillMatch(userSkills: string[], required: string[]): number | null {
  if (!required.length) return null;
  const mine = new Set(userSkills.map((s) => s.toLowerCase()));
  const hits = required.filter((s) => mine.has(s.toLowerCase())).length;
  return Math.round((hits / required.length) * 100);
}
