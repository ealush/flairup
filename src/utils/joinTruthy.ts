export function joinTruthy(arr: unknown[], delimiter: string = ''): string {
  return arr.filter(Boolean).join(delimiter);
}
