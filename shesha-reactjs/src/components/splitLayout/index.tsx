import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { Splitter } from 'antd';
import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { PinnablePanel } from './pinnablePanel';
import { useSplitterStyles } from './splitter-styles';

export interface SplitLayoutProps {
  defaultPanelSize?: number;
  orientation?: 'horizontal' | 'vertical';
  position?: 'start' | 'end';
  panel: ReactNode;
  panelClassName?: string;
  panelTitle: string;
  panelMin?: number | string;
  panelMax?: number | string;

  defaultPinned?: boolean;
  onPinnedToggle?: (pinned: boolean) => void;
  defaultExpanded?: boolean;
  onExpandedToggle?: (expanded: boolean) => void;
}

export const SplitLayout: FC<PropsWithChildren<SplitLayoutProps>> = (props) => {
  const {
    children,
    position = 'start',
    orientation = 'horizontal',
    panel,
    panelClassName,
    panelTitle,
    panelMin,
    panelMax,
    defaultPanelSize = 300,
    defaultPinned = true,
    defaultExpanded = true,
  } = props;
  const { styles } = useSplitterStyles();
  const [panelSize, setPanelSize] = useState<number | undefined>(defaultPanelSize);
  const panelIndex = position === 'start' ? 0 : 1;

  const [panelPinned, setPanelPinned] = useState<boolean>(defaultPinned);
  const handlePanelPinnedToggle = (): void => {
    setPanelPinned(!panelPinned);
    if (props.onPinnedToggle) {
      props.onPinnedToggle(!panelPinned);
    }
  };
  const [panelExpanded, setPanelExpanded] = useState<boolean>(defaultExpanded);
  const handlePanelExpandedToggle = (): void => {
    setPanelExpanded(!panelExpanded);
    if (props.onExpandedToggle) {
      props.onExpandedToggle(!panelExpanded);
    }
  };
  const sizeProps = panelExpanded
    ? isDefined(panelSize) ? { size: panelSize } : {}
    : { size: 40 };

  const panelRef = useRef<HTMLDivElement>(null);

  // Auto‑collapse left on outside click (if not pinned)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      // If the click is on the splitter handle, ignore it
      if (e.target instanceof Element && e.target.closest('.ant-splitter-bar'))
        return;

      if (
        !panelPinned &&
        panelExpanded &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setPanelExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelPinned, panelExpanded]);

  const panelWrapper = (
    <Splitter.Panel
      collapsible={false}
      {...(isDefined(panelMax) ? { max: panelMax } : {})}
      {...(isDefined(panelMin) ? { min: panelMin } : {})}
      {...(!isNullOrWhiteSpace(panelClassName) ? { className: panelClassName } : { })}
      {...sizeProps}
      resizable={panelExpanded}
    >
      <PinnablePanel
        ref={panelRef}
        title={panelTitle}
        expanded={panelExpanded}
        onExpandedToggle={handlePanelExpandedToggle}
        pinned={panelPinned}
        onPinnedToggle={handlePanelPinnedToggle}
        direction={orientation}
      >
        {panel}
      </PinnablePanel>
    </Splitter.Panel>
  );

  const areaWrapper = (
    <Splitter.Panel>
      {children}
    </Splitter.Panel>
  );
  return (
    <Splitter
      orientation={orientation}
      className={styles.vscodeDragger}
      style={{ height: '100%' }}
      onResize={(sizes) => {
        const size = sizes.at(panelIndex);
        setPanelSize(size);
      }}
    >
      {position === 'start' ? [panelWrapper, areaWrapper] : [areaWrapper, panelWrapper]}
    </Splitter>
  );
};
SplitLayout.displayName = 'SplitLayout';
