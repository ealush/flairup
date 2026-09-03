'use client';

import React, { useId, useState } from 'react';

export interface ExampleTabClasses {
  tabs: string;
  tabIdle: string;
  tabSelected: string;
  panel: string;
  codePanel: string;
}

type TabId = 'preview' | 'styles' | 'usage';

const tabLabels: Record<TabId, string> = {
  preview: 'Preview',
  styles: 'Styles',
  usage: 'Usage',
};

interface ExampleTabsProps {
  title: string;
  preview: React.ReactNode;
  stylesCode: React.ReactNode;
  usageCode?: React.ReactNode;
  classes: ExampleTabClasses;
}

export function ExampleTabs({
  title,
  preview,
  stylesCode,
  usageCode,
  classes,
}: ExampleTabsProps) {
  const [selected, setSelected] = useState<TabId>('preview');
  const baseId = useId();
  const tabs: Array<TabId> = usageCode
    ? ['preview', 'styles', 'usage']
    : ['preview', 'styles'];

  const onKeyDown = (event: React.KeyboardEvent, tab: TabId) => {
    const index = tabs.indexOf(tab);
    let next: number | null = null;
    if (event.key === 'ArrowRight') {
      next = (index + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = tabs.length - 1;
    }
    if (next !== null) {
      event.preventDefault();
      setSelected(tabs[next]);
      document.getElementById(`${baseId}-tab-${tabs[next]}`)?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" aria-label={`${title}: views`} className={classes.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            id={`${baseId}-tab-${tab}`}
            role="tab"
            aria-selected={selected === tab}
            aria-controls={`${baseId}-panel-${tab}`}
            tabIndex={selected === tab ? 0 : -1}
            onClick={() => setSelected(tab)}
            onKeyDown={(event) => onKeyDown(event, tab)}
            className={selected === tab ? classes.tabSelected : classes.tabIdle}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel-preview`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-preview`}
        hidden={selected !== 'preview'}
        className={classes.panel}
      >
        {preview}
      </div>
      <div
        id={`${baseId}-panel-styles`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-styles`}
        hidden={selected !== 'styles'}
        className={classes.codePanel}
      >
        {stylesCode}
      </div>
      {usageCode && (
        <div
          id={`${baseId}-panel-usage`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-usage`}
          hidden={selected !== 'usage'}
          className={classes.codePanel}
        >
          {usageCode}
        </div>
      )}
    </div>
  );
}
