export function cx(...args: any[]): string {
  const classes = args.reduce((classes, arg) => {
    if (arg instanceof Set) {
      classes.push(...arg);
    } else if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classes.push(cx(...arg));
    } else if (typeof arg === 'object') {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          classes.push(key);
        }
      });
    }

    return classes;
  }, []);

  return classes.filter(Boolean).join(' ').trim();
}
