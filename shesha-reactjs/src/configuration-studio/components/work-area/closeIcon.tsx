import { useCsSubscription } from '@/configuration-studio/cs/hooks';
import { IDocumentInstance } from '@/configuration-studio/models';
import { CloseOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { HoverCloseIcon } from './closeTabIcon';
type CloseIconProps = {
  doc: IDocumentInstance;
};

export const CloseIcon: FC<CloseIconProps> = ({ doc }) => {
  useCsSubscription('tabs');
  return doc.isDataModified
    ? <HoverCloseIcon />
    : <CloseOutlined />;
};
