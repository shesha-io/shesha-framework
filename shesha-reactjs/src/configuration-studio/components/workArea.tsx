
import React, { FC, useMemo, useState } from 'react';
import { Dropdown, Empty, MenuProps, Tabs, TabsProps } from 'antd';
import { useCsTabs } from '../cs/hooks';
import { DocumentEditor } from './documentEditor';
import { useStyles } from '../styles';
import { TabLabel } from './tab-label';
import { IDocumentInstance } from '../models';
import { isDefined } from '@/utils/nullables';

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
  const {
    docs,
    renderedDocs,
    activeDocId,
    navigateToDocumentAsync,
    closeDocumentAsync,
    reloadDocumentAsync,
    closeMultipleDocumentsAsync,
  } = useCsTabs();
  const { styles } = useStyles();
  const [contextMenuState, setContextMenuState] = useState<TabContextMenuState>();

  const getContextMenuItems = (doc: IDocumentInstance): MenuItem[] => [
    {
      key: 'close',
      label: 'Close',
      onClick: (): void => {
        void closeDocumentAsync(doc.itemId);
      },
    },
    {
      key: 'closeOthers',
      label: 'Close Others',
      onClick: (): void => {
        closeMultipleDocumentsAsync((d) => (d !== doc));
      },
    },
    {
      key: 'closeToTheRight',
      label: 'Close to the Right',
      onClick: (): void => {
        closeMultipleDocumentsAsync((_, index) => {
          const docIndex = docs.indexOf(doc);
          return index > docIndex;
        });
      },
    },
    {
      key: 'closeAll',
      label: 'Close All',
      onClick: (): void => {
        closeMultipleDocumentsAsync((_) => (true));
      },
    },
    { type: 'divider' },
    {
      key: 'reload',
      label: 'Reload',
      onClick: (): void => {
        reloadDocumentAsync(doc.itemId);
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
      closeDocumentAsync(e);
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
        {...isDefined(activeDocId) ? { activeKey: activeDocId } : {}}
        onChange={navigateToDocumentAsync}
        onEdit={handleEdit}
        items={treeTabs}
        destroyOnHidden={false}
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
