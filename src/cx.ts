import { joinTruthy } from './utils/joinTruthy';

export function cx(...args: unknown[]): string {
  const classes = args.reduce((classes: string[], arg) => {
    if (arg instanceof Set) {
      classes.push(...arg);
    } else if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classes.push(cx(...arg));
    } else if (typeof arg === 'object') {
      // @ts-expect-error - it is a string
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          classes.push(key);
        }
      });
    }

    return classes;
  }, [] as string[]);

  return joinTruthy(classes, ' ').trim();
}
