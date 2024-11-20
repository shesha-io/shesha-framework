import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
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
  const { styles } = useStyles();
  const { value, referenceListId, showIcon, solidBackground, showReflistName, style } = props;

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

  const memoizedColor = solidBackground
    ? convertCssColorNameToHex(itemData?.color ?? '')
    : itemData?.color?.toLowerCase();

  const canShowIcon = showIcon && itemData?.icon;

  if (!itemData?.itemValue && !listItem?.loading) return null;

  return listItem?.loading ? (
    <Skeleton.Button />
  ) : (

    <div className={styles.shaStatusTagContainer}>
      <DescriptionTooltip showReflistName={showReflistName} currentStatus={itemData}>


        <RefTag color={memoizedColor} icon={canShowIcon ? <Icon type={itemData?.icon} /> : null} style={style}>
          {showReflistName && itemData?.item}
        </RefTag>

      </DescriptionTooltip>
    </div>
  );
};