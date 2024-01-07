export function asArray<T>(v: T | T[]): T[] {
  return [].concat(v as unknown as []);
}
