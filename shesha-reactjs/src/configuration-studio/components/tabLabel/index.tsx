import { IDocumentInstance, isCIDocument, TreeNodeType } from '@/configuration-studio/models';
import { getIcon } from '@/configuration-studio/tree-utils';
import React, { FC, MouseEventHandler } from 'react';

export interface ITabLabelProps {
    doc: IDocumentInstance;
    onContextMenu?: MouseEventHandler<HTMLDivElement>;
}

export const TabLabel: FC<ITabLabelProps> = ({ doc, onContextMenu }) => {
    const icon = isCIDocument(doc)
        ? getIcon(TreeNodeType.ConfigurationItem, doc.itemType)
        : undefined;

    return (
        <div
            onContextMenu={onContextMenu}
        >
            {icon}
            <span>{doc.label}</span>
        </div>
    );
};