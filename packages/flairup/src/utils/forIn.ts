export function forIn<O extends Record<string, unknown>>(
  obj: O,
  fn: (key: string, value: O[string]) => void,
): void {
  for (const key in obj) {
    fn(key.trim(), obj[key]);
  }
}
