import { isDefined } from '@/utils';
import { Splitter } from 'antd';
import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { PinnablePanel } from './pinnablePanel';
import { useSplitterStyles } from './splitter-styles';

export interface SplitLayoutProps {
  defaultSize?: number;
  orientation?: 'horizontal' | 'vertical';
  position?: 'start' | 'end';
  panel?: ReactNode | undefined;
}

export const SplitLayout: FC<PropsWithChildren<SplitLayoutProps>> = (props) => {
  const {
    children,
    position = 'start',
    orientation = 'horizontal',
    panel,
    defaultSize = 300,
  } = props;
  const { styles } = useSplitterStyles();
  const [panelSize, setPanelSize] = useState<number | undefined>(defaultSize);
  const panelIndex = position === 'start' ? 0 : 1;

  const [panelPinned, setPanelPinned] = useState<boolean>(true);
  const [panelExpanded, setPanelExpanded] = useState<boolean>(true);
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
      min={200}
      max={600}
      {...sizeProps}
      resizable={panelExpanded}
    >
      <PinnablePanel
        ref={panelRef}
        title="Object Explorer"
        expanded={panelExpanded}
        onToggle={() => setPanelExpanded(!panelExpanded)}
        pinned={panelPinned}
        onPinToggle={() => setPanelPinned(!panelPinned)}
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
