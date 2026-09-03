'use client';

import React, { useState } from 'react';

export type LoadingDemo = 'spinner' | 'skeleton' | 'typing';

export interface AnimationDemoClasses {
  switcher: string;
  optionIdle: string;
  optionPressed: string;
}

const options: Array<{ id: LoadingDemo; label: string }> = [
  { id: 'spinner', label: 'Spinner' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'typing', label: 'Typing' },
];

interface AnimationDemoProps {
  classes: AnimationDemoClasses;
  demos: Record<LoadingDemo, React.ReactNode>;
}

export function AnimationDemo({ classes, demos }: AnimationDemoProps) {
  const [selected, setSelected] = useState<LoadingDemo>('spinner');

  return (
    <div>
      <div className={classes.switcher} role="group" aria-label="Loading animation">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected === option.id}
            onClick={() => setSelected(option.id)}
            className={
              selected === option.id ? classes.optionPressed : classes.optionIdle
            }
          >
            {option.label}
          </button>
        ))}
      </div>
      {demos[selected]}
    </div>
  );
}
