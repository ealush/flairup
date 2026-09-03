// Maps a dash-cased shorthand property to the longhand declarations it
// resets. Used for conflict detection so that, for example, `margin`
// conflicts with an earlier `margin-top` in the same context.
const longhands: Record<string, string[]> = {
  margin: [
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'margin-inline-start',
    'margin-inline-end',
    'margin-block-start',
    'margin-block-end',
  ],
  padding: [
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'padding-inline-start',
    'padding-inline-end',
    'padding-block-start',
    'padding-block-end',
  ],
  inset: ['top', 'right', 'bottom', 'left'],
  gap: ['row-gap', 'column-gap'],
  overflow: ['overflow-x', 'overflow-y'],
  'border-width': [
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
  ],
  'border-style': [
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
  ],
  'border-color': [
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
  ],
  'border-top': ['border-top-width', 'border-top-style', 'border-top-color'],
  'border-right': [
    'border-right-width',
    'border-right-style',
    'border-right-color',
  ],
  'border-bottom': [
    'border-bottom-width',
    'border-bottom-style',
    'border-bottom-color',
  ],
  'border-left': [
    'border-left-width',
    'border-left-style',
    'border-left-color',
  ],
  border: [
    'border-width',
    'border-style',
    'border-color',
    'border-top-width',
    'border-top-style',
    'border-top-color',
    'border-right-width',
    'border-right-style',
    'border-right-color',
    'border-bottom-width',
    'border-bottom-style',
    'border-bottom-color',
    'border-left-width',
    'border-left-style',
    'border-left-color',
    'border-image',
    'border-image-source',
    'border-image-slice',
    'border-image-width',
    'border-image-outset',
    'border-image-repeat',
  ],
  'border-radius': [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],
  outline: ['outline-width', 'outline-style', 'outline-color'],
  background: [
    'background-color',
    'background-image',
    'background-position',
    'background-size',
    'background-repeat',
    'background-attachment',
    'background-origin',
    'background-clip',
  ],
  font: [
    'font-style',
    'font-variant',
    'font-weight',
    'font-size',
    'font-family',
    'line-height',
  ],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
  'text-decoration': [
    'text-decoration-line',
    'text-decoration-style',
    'text-decoration-color',
    'text-decoration-thickness',
  ],
};

export function coveredProperties(property: string): string[] {
  const covered = longhands[property];
  if (covered) {
    return [property].concat(covered);
  }
  return [property];
}

// Shorthands whose value distributes to independent longhands: `margin`
// sets each side, `gap` sets row/column, `border-radius` sets each corner.
// Other shorthands (background, font, border, outline, ...) reset their
// longhands to values that cannot be derived from the shorthand text, so
// they stay atomic.
export type DistributiveKind = 'box' | 'pair' | 'corners';

const distributiveKinds: Record<string, DistributiveKind> = {
  margin: 'box',
  padding: 'box',
  inset: 'box',
  'border-width': 'box',
  'border-style': 'box',
  'border-color': 'box',
  gap: 'pair',
  overflow: 'pair',
  'border-radius': 'corners',
};

export function distributiveExpansion(
  property: string,
): { kind: DistributiveKind; longhands: string[] } | undefined {
  const kind = distributiveKinds[property];
  const covered = kind ? longhands[property] : undefined;
  if (!kind || !covered) {
    return undefined;
  }
  return { kind, longhands: covered };
}
