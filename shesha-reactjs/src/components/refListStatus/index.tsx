import React, { CSSProperties, FC } from 'react';
import RefTag from './tag';
import { Alert, Skeleton } from 'antd';
import { DescriptionTooltip } from './tooltip';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';
import { useStyles } from './styles/styles';
import { extractErrorMessage } from '@/providers/referenceListDispatcher/models';
import * as antdIcons from '@ant-design/icons';

export interface IRefListStatusProps {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
  style?: CSSProperties;
  value?: any;
  isDesigner?: boolean;
}

const Icon = ({ type, ...rest }): JSX.Element => {
  const icons = antdIcons;
  const Component = icons[type];
  return <Component {...rest} />;
};

export const RefListStatus: FC<IRefListStatusProps> = (props) => {
  const {
    value,
    referenceListId,
    showIcon,
    solidBackground,
    showReflistName,
    style = {},
    isDesigner = false,
  } = props;
  const { width, height, minHeight, minWidth, maxHeight, maxWidth } = style;
  const dimensionsStyles = { width, height, minHeight, minWidth, maxHeight, maxWidth };
  const { fontSize, fontWeight, textAlign, color, backgroundColor, backgroundImage, ...rest } = style;
  const fontStyles = { fontSize, fontWeight, textAlign };
  const { styles } = useStyles({ dimensionsStyles, fontStyles });
  const listItem = useReferenceListItem(referenceListId?.module, referenceListId?.name, value);

  if (listItem?.error && !listItem?.loading) {
    return (
      <Alert
        showIcon
        message="Something went during Reflists fetch"
        description={extractErrorMessage(listItem.error)}
        type="error"
      />
    );
  }

  const itemData = listItem?.data;

  const canShowIcon = showIcon && itemData?.icon;

  // In designer mode, show a placeholder when there's no value or data
  if (typeof itemData?.itemValue === 'undefined' && !listItem?.loading) {
    if (isDesigner) {
      return (
        <div className={styles.shaStatusTagContainer}>
          <RefTag
            color="#d9d9d9"
            icon={null}
            style={style}
            styles={styles}
          >
            {showReflistName ? 'Reference List Item' : 'N/A'}
          </RefTag>
        </div>
      );
    }
    return null;
  }

  return listItem?.loading || !itemData ? (
    <Skeleton.Button />
  ) : (

    <div className={styles.shaStatusTagContainer}>
      <DescriptionTooltip showReflistName={showReflistName} currentStatus={itemData}>
        <RefTag
          color={solidBackground && itemData?.color}
          icon={canShowIcon ? <Icon type={itemData?.icon} /> : null}
          style={!solidBackground || !itemData?.color ? style : { ...rest }}
          styles={styles}
        >
          {showReflistName && itemData?.item}
        </RefTag>
      </DescriptionTooltip>
    </div>
  );
};
