export function orderUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
