import React, { FC, PropsWithChildren } from 'react';
import { ReferenceListItemDto } from 'apis/referenceList';
import { Tooltip } from 'antd';

interface IToolTipProps {
  currentStatus: ReferenceListItemDto;
  showReflistName: boolean;
}

export const DescriptionTooltip: FC<PropsWithChildren<IToolTipProps>> = ({ currentStatus, showReflistName, children }) => {

  return !showReflistName || !currentStatus || !currentStatus.description
    ? <>{children}</>
    : (
      <Tooltip
        placement="rightTop"
        title={currentStatus.description}
      >
        {children}
      </Tooltip>
    );
};