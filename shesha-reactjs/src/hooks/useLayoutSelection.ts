import { useState, useCallback, ReactElement } from 'react';
import MainLayout, { getLayout } from '@/components/mainLayout';
import HorizontalLayout, { getHorizontalLayout } from '@/components/horizontalLayout';

export type LayoutMode = 'defaultLayout' | 'horizontalLayout';

export interface ILayoutSelectionHook {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  getLayoutWrapper: (page: ReactElement) => JSX.Element;
  LayoutComponent: typeof MainLayout | typeof HorizontalLayout;
}

/**
 * Hook for selecting and managing layout mode
 * @param defaultMode The default layout mode to use ('defaultLayout' | 'horizontalLayout')
 * @returns Object containing current layout mode, setter function, layout wrapper, and layout component
 */
export const useLayoutSelection = (defaultMode: LayoutMode = 'defaultLayout'): ILayoutSelectionHook => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(defaultMode);

  const getLayoutWrapper = useCallback((page: ReactElement): JSX.Element => {
    switch (layoutMode) {
      case 'horizontalLayout':
        return getHorizontalLayout(page);
      case 'defaultLayout':
      default:
        return getLayout(page);
    }
  }, [layoutMode]);

  const LayoutComponent = layoutMode === 'horizontalLayout' ? HorizontalLayout : MainLayout;

  return {
    layoutMode,
    setLayoutMode,
    getLayoutWrapper,
    LayoutComponent,
  };
};
