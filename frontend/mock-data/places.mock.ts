import type { Place } from '../src/types/models';
import { getMockErrorRate } from '../src/config/env';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function randomDelay() {
  return delay(200 + Math.floor(Math.random() * 300));
}
function maybeError(): void {
  const rate = getMockErrorRate();
  if (rate > 0 && Math.random() < rate) {
    const statuses = [400, 404, 500, 503];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const err = new Error(`Mock error ${status}`);
    // @ts-expect-error decorate
    err.status = status;
    throw err;
  }
}

export const PLACES: Place[] = [
  {
    id: 'place_长安',
    canonical_name: '长安',
    alt_names: ['镐京'],
    location: { type: 'Point', coordinates: [108.95, 34.34] },
    description: '秦汉时期的都城',
  },
] satisfies Place[];

export async function getPlaces() {
  await randomDelay();
  maybeError();
  try {
    const { PlaceSchema } = await import('../src/types/schemas');
    PlaceSchema.array().parse(PLACES);
  } catch {
    // ignore validation errors in mock mode
  }
  return { data: PLACES };
}
