import React, { FC, PropsWithChildren } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { Tooltip } from 'antd';
import { useStyles } from './styles/styles';

interface IToolTipProps {
  currentStatus: ReferenceListItemDto;
  showReflistName: boolean;
}

export const DescriptionTooltip: FC<PropsWithChildren<IToolTipProps>> = ({
  currentStatus,
  showReflistName,
  children,
}) => {
  const { styles } = useStyles();
  const popReflistName = !!(!showReflistName && currentStatus?.item);

  const showToolTip = !!currentStatus?.description || popReflistName;

  return showToolTip ? (
    <Tooltip
      placement="rightTop"
      title={
        <div className={styles.toolTipContent}>
          {popReflistName && (
            <>
              <span>{currentStatus?.item}</span>
              <br />
            </>
          )}
          <span>{currentStatus.description}</span>
        </div>
      }
    >
      <>{children}</>
    </Tooltip>
  ) : (
    <>{children}</>
  );
};
