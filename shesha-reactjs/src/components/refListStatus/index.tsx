import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';
import { extractErrorMessage } from '@/providers/referenceListDispatcher/models';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { Alert, Skeleton } from 'antd';
import React, { CSSProperties, FC } from 'react';
import { ShaIcon } from '../shaIcon';
import { useStyles } from './styles/styles';
import RefTag from './tag';
import { DescriptionTooltip } from './tooltip';
import { CSSObject } from 'antd-style';

export interface IRefListStatusProps {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean | undefined;
  solidBackground?: boolean | undefined;
  showReflistName?: boolean | undefined;
  style?: CSSProperties | undefined;
  value?: number | undefined;
  isDesigner?: boolean | undefined;
}

export const RefListStatus: FC<IRefListStatusProps> = (props) => {
  const {
    value,
    referenceListId,
    showIcon,
    solidBackground,
    showReflistName = false,
    style = {},
    isDesigner = false,
  } = props;
  const { width, height, minHeight, minWidth, maxHeight, maxWidth } = style;
  const dimensionsStyles = { width, height, minHeight, minWidth, maxHeight, maxWidth };
  const { fontSize, fontWeight, textAlign, color, backgroundColor, backgroundImage, ...rest } = style;
  const fontStyles = { fontSize, fontWeight, textAlign };
  const { styles } = useStyles({ dimensionsStyles, fontStyles: fontStyles as CSSObject });
  const listItem = useReferenceListItem(referenceListId.module, referenceListId.name, value);

  if (listItem.error && !listItem.loading) {
    return (
      <Alert
        showIcon
        title="Something went during Reflists fetch"
        description={extractErrorMessage(listItem.error)}
        type="error"
      />
    );
  }

  const itemData = listItem.data;

  const canShowIcon = showIcon && itemData?.icon;

  // In designer mode, show a placeholder when there's no value or data
  if (typeof itemData?.itemValue === 'undefined' && !listItem.loading) {
    if (isDesigner) {
      return (
        <div className={styles.shaStatusTagContainer}>
          <RefTag
            color="#d9d9d9"
            icon={null}
            style={style}
            className={styles.shaStatusTag}
          >
            {showReflistName ? 'Reference List Item' : 'N/A'}
          </RefTag>
        </div>
      );
    }
    return null;
  }

  return listItem.loading || !itemData ? (
    <Skeleton.Button />
  ) : (

    <div className={styles.shaStatusTagContainer}>
      <DescriptionTooltip showReflistName={showReflistName} currentStatus={itemData}>
        <RefTag
          {...(solidBackground && !isNullOrWhiteSpace(itemData.color) ? { color: itemData.color } : {})}
          icon={canShowIcon && !isNullOrWhiteSpace(itemData.icon) ? <ShaIcon iconName={itemData.icon} /> : null}
          style={!solidBackground || !itemData.color ? style : { ...rest }}
          className={styles.shaStatusTag}
        >
          {showReflistName && itemData.item}
        </RefTag>
      </DescriptionTooltip>
    </div>
  );
};
