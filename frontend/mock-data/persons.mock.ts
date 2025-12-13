import type { Person } from '../src/types/models';
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

export const PERSONS: Person[] = [
  { id: 'per_秦始皇', name: '秦始皇', birthYear: -259, deathYear: -210, roles: ['emperor'] },
  { id: 'per_李世民', name: '李世民', birthYear: 598, deathYear: 649, roles: ['emperor'] },
] satisfies Person[];

export async function getPersons() {
  await randomDelay();
  maybeError();
  try {
    const { PersonSchema } = await import('../src/types/schemas');
    PersonSchema.array().parse(PERSONS);
  } catch {
    // ignore validation errors in mock mode
  }
  return { data: PERSONS };
}

export async function getPerson(id: string) {
  await randomDelay();
  maybeError();
  const found = PERSONS.find((p) => p.id === id);
  if (!found) {
    const err = new Error('Mock 404');
    // @ts-expect-error decorate
    err.status = 404;
    throw err;
  }
  try {
    const { PersonSchema } = await import('../src/types/schemas');
    PersonSchema.parse(found);
  } catch {
    // ignore validation errors in mock mode
  }
  return { data: found };
}
