import React, { FC, ReactNode, useMemo, useRef } from 'react';
import { Empty, Tabs, TabsProps } from 'antd';
import { useCsTabs } from '../cs/hooks';
import { getIcon } from '../tree-utils';
import { TreeNodeType } from '../models';
import { DocumentEditor } from './documentEditor';
import { isCIDocument } from '../models';
import { useStyles } from '../styles';

export interface IWorkAreaProps {
}

type Tab = TabsProps['items'][number];
type OnEdit = TabsProps['onEdit'];

export const WorkArea: FC<IWorkAreaProps> = () => {
    const { docs, activeDocId, openDocById, removeTab } = useCsTabs();
    const { styles } = useStyles();

    // store rendered docs to keep them unchanged after manipulations with opened tabs
    const renderedDocsRef = useRef<Map<string, ReactNode>>(new Map<string, ReactNode>());
    const renderedDocs = renderedDocsRef.current;

    const treeTabs = useMemo<Tab[]>(() => {
        const result: Tab[] = [];
        const actualDocs = new Set<string>();
        docs.forEach(t => {
            const tabContent = renderedDocs.has(t.itemId)
                ? renderedDocs.get(t.itemId)
                : <DocumentEditor doc={t} key={t.itemId} />;

            renderedDocs.set(t.itemId, tabContent);
            actualDocs.add(t.itemId);

            result.push({
                key: t.itemId,
                label: t.label,
                icon: isCIDocument(t)
                    ? getIcon(TreeNodeType.ConfigurationItem, t.itemType)
                    : undefined,
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
            removeTab(e);
        }
    };

    if (treeTabs.length === 0)
        return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Please select a node to begin editing'} />
        );

    return (
        <Tabs
            className={styles.csDocTabs}
            hideAdd
            type="editable-card"
            size='small'
            activeKey={activeDocId}
            onChange={openDocById}
            onEdit={handleEdit}
            items={treeTabs}
        />
    );
};