'use client';

import React, { useState } from 'react';
import type { HeroDemoClasses, HeroDemoVariant } from './HeroDemoStyles';

const variants: Array<HeroDemoVariant> = ['primary', 'secondary', 'quiet'];

const variantScope: Record<HeroDemoVariant, string> = {
  primary: 'styles.demoPrimary',
  secondary: 'styles.demoSecondary',
  quiet: 'styles.demoQuiet',
};

export function HeroDemo({ classes }: { classes: HeroDemoClasses }) {
  const [variant, setVariant] = useState<HeroDemoVariant>('primary');

  return (
    <div className={classes.demo}>
      <p className={classes.demoLabel}>Live demo — pick a variant</p>
      <div className={classes.stage}>
        <button type="button" className={classes.demoButton[variant]}>
          Save changes
        </button>
      </div>
      <div className={classes.switcher} role="group" aria-label="Button variant">
        {variants.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={variant === option}
            onClick={() => setVariant(option)}
            className={classes.pill[variant][option]}
          >
            {option}
          </button>
        ))}
      </div>
      <p className={classes.caption}>{variantScope[variant]}</p>
    </div>
  );
}
