// Tracks which declarations each generated class name carries so that
// cx() can resolve same-context conflicts deterministically. A class can
// map to several keys when one hash is shared across states (for example
// across pseudo selectors of the same scope).
const classConflicts: Map<string, Set<string>> = new Map();

export function registerClassConflict(
  className: string,
  conflictKeys: string[],
): void {
  const existing = classConflicts.get(className);
  if (existing) {
    conflictKeys.forEach((key) => existing.add(key));
    return;
  }
  classConflicts.set(className, new Set(conflictKeys));
}

export function getClassConflicts(className: string): string[] | undefined {
  const found = classConflicts.get(className);
  return found ? Array.from(found) : undefined;
}
