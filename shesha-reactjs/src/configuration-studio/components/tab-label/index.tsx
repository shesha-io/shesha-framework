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
