
import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, Empty, Tabs, TabsProps } from 'antd';
import { useCsTabs } from '../../cs/hooks';
import { DocumentEditor } from '../documentEditor';
import { useStyles } from '../../styles';
import { TabLabel } from '../tab-label';
import { IDocumentInstance } from '../../models';
import { isDefined } from '@/utils/nullables';
import { DraggableTabWithGapPlaceholder, TabsDragState, TabPosition } from '../draggable-tab';
import { CloseIcon } from './closeIcon';
import { getContextMenuItems } from './utils';

type Tab = Required<TabsProps>['items'][number];
type OnEdit = TabsProps['onEdit'];
type RenderTabBar = Required<TabsProps>['renderTabBar'];

type TabContextMenuState = {
  isVisible: boolean;
  doc: IDocumentInstance;
  x: number;
  y: number;
};

export const WorkArea: FC = () => {
  const tabsApi = useCsTabs();
  const {
    docs,
    renderedDocs,
    activeDocId,
    navigateToDocumentAsync,
    closeDocumentAsync,
    reorderDocumentsAsync,
  } = tabsApi;
  const { styles } = useStyles();
  const [contextMenuState, setContextMenuState] = useState<TabContextMenuState>();

  const [dragState, setDragState] = useState<TabsDragState>({
    isDragging: false,
    sourceIndex: null,
    placeholderIndex: null,
  });

  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const [tabPositions, setTabPositions] = useState<TabPosition[]>([]);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, doc: IDocumentInstance): void => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuState({ doc, x: e.clientX, y: e.clientY, isVisible: true });
  };

  const treeTabs = useMemo<Tab[]>(() => {
    const result: Tab[] = [];
    const actualDocs = new Set<string>();
    docs.forEach((doc) => {
      const tabContent = renderedDocs.has(doc.itemId)
        ? renderedDocs.get(doc.itemId)
        : <DocumentEditor doc={doc} key={doc.itemId} />;

      renderedDocs.set(doc.itemId, tabContent);
      actualDocs.add(doc.itemId);

      result.push({
        key: doc.itemId,
        label: <TabLabel doc={doc} onContextMenu={(e) => handleContextMenu(e, doc)} />,
        children: tabContent,
        closeIcon: <CloseIcon doc={doc} />,
      });
    });
    // remove stale docs
    renderedDocs.forEach((_value, key) => {
      if (!actualDocs.has(key)) {
        renderedDocs.delete(key);
      }
    });

    return result;
  }, [docs, renderedDocs]);

  // Update tab positions when tabs change
  useEffect(() => {
    const tabBar = tabBarRef.current;
    if (tabBar) {
      const tabElements = tabBar.querySelectorAll('.ant-tabs-tab');
      const positions = Array.from(tabElements).map((tab) => {
        const rect = tab.getBoundingClientRect();
        const containerRect = tabBar.getBoundingClientRect();
        return {
          left: rect.left - containerRect.left,
          right: rect.right - containerRect.left,
          width: rect.width,
        };
      });
      setTabPositions(positions);
    }
  }, [treeTabs, dragState.isDragging]);

  const handleEdit: OnEdit = (e, action) => {
    if (action === 'remove' && typeof (e) === 'string') {
      closeDocumentAsync(e, true, true);
    }
  };

  const getPlaceholderPosition = (): CSSProperties | undefined => {
    if (!dragState.isDragging || dragState.placeholderIndex === null || tabPositions.length === 0) {
      return undefined;
    }

    if (dragState.placeholderIndex === 0) {
      // Before first tab
      return { left: -2, height: '20px' };
    } else if (dragState.placeholderIndex >= tabPositions.length) {
      // After last tab
      const lastTab = tabPositions[tabPositions.length - 1]!;
      return { left: lastTab.right - 2, height: '20px' };
    } else {
      // Between tabs
      const leftTab = tabPositions[dragState.placeholderIndex - 1]!;
      return { left: leftTab.right - 2, height: '20px' };
    }
  };

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    void reorderDocumentsAsync(fromIndex, toIndex);
    setDragState({ isDragging: false, sourceIndex: null, placeholderIndex: null });
  }, [reorderDocumentsAsync]);

  // dragState: Partial<DragState>
  const updateDragState = useCallback((newState: Partial<TabsDragState>) => {
    setDragState((prev) => ({ ...prev, ...newState }));
  }, []);

  if (treeTabs.length === 0)
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a node to begin editing" />
    );

  const placeholderStyle = getPlaceholderPosition();

  const renderTabBar: RenderTabBar = (props, DefaultTabBar) => (
    <div
      ref={tabBarRef}
      style={{ flex: 1, position: 'relative' }}
    >
      {/* Visual gap placeholder */}
      {placeholderStyle && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${placeholderStyle.left}px`,
            width: '2px',
            height: 'calc(100% - 16px)',
            backgroundColor: '#1890ff',
            borderRadius: '2px',
            zIndex: 1000,
            boxShadow: '0 0 4px rgba(24, 144, 255, 0.6)',
            transition: 'left 0.1s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      <DefaultTabBar
        {...props}
        onTabClick={navigateToDocumentAsync}
      >
        {(node) => {
          return (
            <DraggableTabWithGapPlaceholder
              key={node.key}
              node={node}
              tabKey={node.key!}
              index={treeTabs.findIndex((tab) => tab.key === node.key)}
              onReorder={reorderTabs}
              dragState={dragState}
              updateDragState={updateDragState}
              totalTabs={treeTabs.length}
              tabPositions={tabPositions}
            />
          );
        }}
      </DefaultTabBar>
    </div>
  );

  return (
    <>
      <Tabs
        className={styles.csDocTabs}
        hideAdd
        type="editable-card"
        size="small"
        {...isDefined(activeDocId) ? { activeKey: activeDocId } : {}}
        onChange={navigateToDocumentAsync}
        onEdit={handleEdit}
        items={treeTabs}
        destroyOnHidden={false}
        renderTabBar={renderTabBar}
      />
      {contextMenuState && (
        <Dropdown
          open={contextMenuState.isVisible}
          onOpenChange={(visible) => setContextMenuState({ ...contextMenuState, isVisible: visible })}
          menu={{
            items: getContextMenuItems(tabsApi, contextMenuState.doc),
          }}
          trigger={['contextMenu']}
          align={{ points: ['tl', 'tr'] }}
        >
          <div
            style={{
              position: 'fixed',
              left: contextMenuState.x,
              top: contextMenuState.y,
              width: 1,
              height: 1,
            }}
          />
        </Dropdown>
      )}
    </>
  );
};
