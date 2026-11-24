/**
 * Engine resilience guard.
 *
 * Month-end grows four state arrays (history, news, decisions, firedEvents,
 * pendingEffects). In development, hostile environments can hand back
 * non-extensible arrays — observed once in the wild when React's dev-mode
 * fiber freezing (preventExtensions on thousands of internals per session)
 * coincided with state arrays. Property writes on such arrays keep working;
 * only .push() throws, which is why the failure surfaced as a single
 * "Cannot add property N, object is not extensible" at history.push.
 *
 * ensureMutable() swaps in a fresh copy of the array when it cannot grow.
 * It changes no values, no ordering and no formulas — a frozen array is
 * copied, a normal one is returned untouched.
 */
export function ensureMutable<T>(arr: T[]): T[] {
  return Object.isExtensible(arr) ? arr : [...arr];
}
