import React, { FC, ReactNode, useMemo, useRef, useState } from 'react';
import { Dropdown, Empty, MenuProps, Tabs, TabsProps } from 'antd';
import { useCsTabs } from '../cs/hooks';
import { DocumentEditor } from './documentEditor';
import { useStyles } from '../styles';
import { TabLabel } from './tab-label';
import { IDocumentInstance } from '../models';

type Tab = Required<TabsProps>['items'][number];
type OnEdit = TabsProps['onEdit'];
type MenuItem = Required<MenuProps>['items'][number];

type TabContextMenuState = {
  isVisible: boolean;
  doc: IDocumentInstance;
  x: number;
  y: number;
};

export const WorkArea: FC = () => {
  const { docs, activeDocId, openDocById, closeDoc, closeMultipleDocs } = useCsTabs();
  const { styles } = useStyles();
  const [contextMenuState, setContextMenuState] = useState<TabContextMenuState>();

  // store rendered docs to keep them unchanged after manipulations with opened tabs
  const renderedDocsRef = useRef<Map<string, ReactNode>>(new Map<string, ReactNode>());
  const renderedDocs = renderedDocsRef.current;

  const getContextMenuItems = (doc: IDocumentInstance): MenuItem[] => [
    {
      key: 'close',
      label: 'Close',
      onClick: (): void => closeDoc(doc.itemId),
    },
    {
      key: 'closeOthers',
      label: 'Close Others',
      onClick: (): void => {
        closeMultipleDocs((d) => (d !== doc));
      },
    },
    {
      key: 'closeToTheRight',
      label: 'Close to the Right',
      onClick: (): void => {
        closeMultipleDocs((_, index) => {
          const docIndex = docs.indexOf(doc);
          return index > docIndex;
        });
      },
    },
    {
      key: 'closeAll',
      label: 'Close All',
      onClick: (): void => {
        closeMultipleDocs((_) => (true));
      },
    },
  ];

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

  const handleEdit: OnEdit = (e, action) => {
    if (action === 'remove' && typeof (e) === 'string') {
      closeDoc(e);
    }
  };

  if (treeTabs.length === 0)
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a node to begin editing" />
    );

  return (
    <>
      <Tabs
        className={styles.csDocTabs}
        hideAdd
        type="editable-card"
        size="small"
        activeKey={activeDocId}
        onChange={openDocById}
        onEdit={handleEdit}
        items={treeTabs}
      />
      {contextMenuState && (
        <Dropdown
          open={contextMenuState.isVisible}
          onOpenChange={(visible) => setContextMenuState({ ...contextMenuState, isVisible: visible })}
          menu={{
            items: getContextMenuItems(contextMenuState.doc),
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
