import React, { FC, PropsWithChildren } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { Tooltip } from 'antd';
import { isNullOrWhiteSpace } from '@/utils/nullables';

interface IToolTipProps {
  currentStatus: ReferenceListItemDto;
  showReflistName: boolean;
}

export const DescriptionTooltip: FC<PropsWithChildren<IToolTipProps>> = ({
  currentStatus,
  showReflistName,
  children,
}) => {
  const popReflistName = !showReflistName && !isNullOrWhiteSpace(currentStatus.item);

  const showToolTip = !isNullOrWhiteSpace(currentStatus.description) || popReflistName;


  return showToolTip ? (
    <Tooltip
      placement="right"
      title={(
        <div>
          {popReflistName && (
            <>
              <span>{currentStatus.item}</span>
              <br />
            </>
          )}
          <span>{currentStatus.description}</span>
        </div>
      )}
    >
      <>{children}</>
    </Tooltip>
  ) : (
    <>{children}</>
  );
};
