import { IDocumentInstance, isCIDocument, isCustomDocument, TreeNodeType } from '@/configuration-studio/models';
import { getCustomIcon, getIcon } from '@/configuration-studio/tree-utils';
import React, { FC, MouseEventHandler } from 'react';

export interface ITabLabelProps {
  doc: IDocumentInstance;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
}

export const TabLabel: FC<ITabLabelProps> = ({ doc, onContextMenu }) => {
  const icon = isCIDocument(doc)
    ? getIcon(TreeNodeType.ConfigurationItem, doc.itemType)
    : isCustomDocument(doc)
      ? getCustomIcon(doc)
      : undefined;

  const title = isCIDocument(doc)
    ? `${doc.moduleName}/${doc.label}`
    : undefined;

  return (
    <div
      onContextMenu={onContextMenu}
      title={title}
    >
      {icon}
      <span>{doc.label}</span>
    </div>
  );
};
