export function formatScholarYear(year: number | null | undefined): string {
  if (!isKnownHistoricalYear(year)) return '年份不详';
  return year < 0 ? `公元前${Math.abs(year)}年` : `${year}年`;
}

export function formatScholarLifespan(
  birthYear: number | null | undefined,
  deathYear: number | null | undefined,
): string | null {
  const birthKnown = isKnownHistoricalYear(birthYear);
  const deathKnown = isKnownHistoricalYear(deathYear);

  if (!birthKnown && !deathKnown) return null;

  const birth = birthKnown ? formatScholarYear(birthYear) : '生年不详';
  const death = deathKnown ? formatScholarYear(deathYear) : '卒年不详';
  return `${birth} - ${death}`;
}

function isKnownHistoricalYear(year: number | null | undefined): year is number {
  return typeof year === 'number' && Number.isFinite(year) && year !== 0;
}
