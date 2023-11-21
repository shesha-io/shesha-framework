import React, { CSSProperties, FC } from 'react';
import './styles/index.less';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Alert, Skeleton } from 'antd';
import { DescriptionTooltip } from './tooltip';
import { useReferenceListItem } from 'providers/referenceListDispatcher';
import { IReferenceListIdentifier } from 'interfaces/referenceList';
import RefTag from './tag';

export interface IRefListStatusProps {
  referenceListId: IReferenceListIdentifier;
  showIcon?: boolean;
  solidBackground?: boolean;
  showReflistName?: boolean;
  style?: CSSProperties;
  value?: any;
}

export const RefListStatus: FC<IRefListStatusProps> = (props) => {
  const { value, referenceListId, showIcon, solidBackground, style, showReflistName } = props;

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
    <div className="sha-status-tag-container">
      <DescriptionTooltip showReflistName={showReflistName} currentStatus={itemData}>
        <RefTag color={memoizedColor} style={style} icon={canShowIcon ? <Icon type={itemData?.icon} /> : null}>
          {showReflistName && itemData?.item}
        </RefTag>
      </DescriptionTooltip>
    </div>
  );
};

const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};
