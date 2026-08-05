import { useConfigurationStudioEnvironment } from '@/configuration-studio/cs-environment/contexts';
import { CIDocument, IDocumentInstance, isCIDocument, isCustomDocument, TreeNodeType } from '@/configuration-studio/models';
import { getCustomIcon, getIcon } from '@/configuration-studio/tree-utils';
import { isNullOrWhiteSpace } from '@/utils';
import React, { FC, MouseEventHandler } from 'react';

export interface ITabLabelProps {
  doc: IDocumentInstance;
  onContextMenu?: MouseEventHandler<HTMLDivElement>;
}

const getDocTitle = (doc: CIDocument): string => {
  const fullName = `${doc.moduleName}/${doc.label}`;
  return !isNullOrWhiteSpace(doc.applicationName)
    ? `${fullName}\r\nApplication: ${doc.applicationName}`
    : fullName;
};

export const TabLabel: FC<ITabLabelProps> = ({ doc, onContextMenu }) => {
  const csEnv = useConfigurationStudioEnvironment();
  const icon = isCIDocument(doc)
    ? getIcon(csEnv, TreeNodeType.ConfigurationItem, doc.itemType)
    : isCustomDocument(doc)
      ? getCustomIcon(doc)
      : undefined;

  const title = isCIDocument(doc)
    ? getDocTitle(doc)
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
