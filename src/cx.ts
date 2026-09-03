import { getClassConflicts } from './classRegistry.js';

export function cx(...args: unknown[]): string {
  const tokens: string[] = [];
  flattenCxArgs(args, tokens);
  return resolveCxConflicts(tokens);
}

function flattenCxArgs(args: unknown[], tokens: string[]): void {
  args.forEach((arg) => pushCxArg(arg, tokens));
}

function pushCxArg(arg: unknown, tokens: string[]): void {
  if (typeof arg === 'string') {
    splitCxToken(arg, tokens);
    return;
  }

  if (arg && typeof arg === 'object') {
    pushCxComposite(arg, tokens);
  }
}

function pushCxComposite(arg: object, tokens: string[]): void {
  if (arg instanceof Set) {
    arg.forEach((value: unknown) => pushCxArg(value, tokens));
    return;
  }

  if (Array.isArray(arg)) {
    flattenCxArgs(arg, tokens);
    return;
  }

  pushCxObject(arg, tokens);
}

function pushCxObject(arg: object, tokens: string[]): void {
  Object.entries(arg as Record<string, unknown>).forEach(([key, value]) => {
    if (value) {
      splitCxToken(key, tokens);
    }
  });
}

function splitCxToken(token: string, tokens: string[]): void {
  token.split(/\s+/).forEach((part) => {
    if (part) {
      tokens.push(part);
    }
  });
}

// When several classes set the same declaration in the same context, only
// the last one survives, so the winner follows cx() order instead of the
// order the styles were created in. Classes from different contexts (pseudo
// states, media queries) never conflict with each other.
function resolveCxConflicts(tokens: string[]): string {
  const claimed = new Set<string>();
  const keep: boolean[] = tokens.map(() => false);
  claimCxTokens(tokens, keep, claimed);
  return tokens.filter((_, index) => keep[index]).join(' ');
}

function claimCxTokens(
  tokens: string[],
  keep: boolean[],
  claimed: Set<string>,
): void {
  for (let index = tokens.length - 1; index >= 0; index--) {
    claimCxToken(tokens, keep, claimed, index);
  }
}

function claimCxToken(
  tokens: string[],
  keep: boolean[],
  claimed: Set<string>,
  index: number,
): void {
  const token = tokens[index] as string;
  const keys = getClassConflicts(token) ?? [token];

  if (!keys.some((key) => !claimed.has(key))) {
    return;
  }

  keep[index] = true;
  keys.forEach((key) => claimed.add(key));
}
