import React, { CSSProperties, FC } from 'react';
import RefTag from './tag';
import { Alert, Skeleton } from 'antd';
import { DescriptionTooltip } from './tooltip';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useReferenceListItem } from '@/providers/referenceListDispatcher';
import { useStyles } from './styles/styles';

export interface IRefListStatusProps {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
  style?: CSSProperties;
  value?: any;
}

const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
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
        description={listItem.error.message}
        type="error"
      />
    );
  }

  const itemData = listItem?.data;

  const canShowIcon = showIcon && itemData?.icon;

  if (typeof itemData?.itemValue === 'undefined' && !listItem?.loading) return null;

  return listItem?.loading ? (
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