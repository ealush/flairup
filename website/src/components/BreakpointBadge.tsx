'use client';

import React, { useEffect, useState } from 'react';

const QUERIES = [
  { id: 'xl', label: 'xl · 1280px and up', query: '(min-width: 1280px)' },
  { id: 'lg', label: 'lg · 1024px and up', query: '(min-width: 1024px)' },
  { id: 'md', label: 'md · 720px and up', query: '(min-width: 720px)' },
  { id: 'sm', label: 'sm · 480px and up', query: '(min-width: 480px)' },
];

const BASE_LABEL = 'base · under 480px';

interface BreakpointBadgeProps {
  className: string;
  valueClassName: string;
}

export function BreakpointBadge({ className, valueClassName }: BreakpointBadgeProps) {
  const [active, setActive] = useState(BASE_LABEL);

  useEffect(() => {
    const lists = QUERIES.map((entry) => ({
      ...entry,
      matches: window.matchMedia(entry.query),
    }));
    const update = () => {
      setActive(lists.find((entry) => entry.matches.matches)?.label ?? BASE_LABEL);
    };
    update();
    lists.forEach((entry) => entry.matches.addEventListener('change', update));
    return () => {
      lists.forEach((entry) =>
        entry.matches.removeEventListener('change', update),
      );
    };
  }, []);

  return (
    <p className={className}>
      Viewport: <strong className={valueClassName}>{active}</strong>
    </p>
  );
}
