import { Alert, Tooltip } from 'antd';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import React, { FC } from 'react';
import { FormMode, useForm, useGlobalState } from '../../../providers';
import { useReferenceListItem } from '../../../providers/referenceListDispatcher';
import { getStyle } from '../../../utils/publicUtils';
import { IRefListStatusProps } from '../models';
import '../styles/index.less';
import ToolTipTittle from './tooltip';
import RefTag from './tag';

interface IProps {
  formMode?: FormMode;
  model: IRefListStatusProps;
  onChange?: Function;
  value?: any;
}

const RefListStatusControl: FC<IProps> = ({ model, value }) => {
  const { formData: data } = useForm();
  const { globalState } = useGlobalState();
  const { referenceListId, showIcon, solidBackground, style, showReflistName } = model;

  const listItem = useReferenceListItem(referenceListId?.module, referenceListId?.name, value);

  if (listItem?.error && !listItem?.loading) {
    return (
      <Alert
        showIcon
        message="Something went wrong during Reflists fetch"
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

  const showToolTip =
    (itemData?.description && showReflistName) || (!showReflistName && (itemData?.item || itemData?.description));

  return (
    <div className="sha-status-tag-container">
      {showToolTip ? (
        <Tooltip
          placement="rightTop"
          title={<ToolTipTittle showReflistName={showReflistName} currentStatus={itemData} />}
        >
          <RefTag
            color={memoizedColor}
            style={{ ...getStyle(style, data, globalState) }}
            icon={canShowIcon ? <Icon type={itemData?.icon} /> : null}
          >
            {showReflistName && itemData?.item}
          </RefTag>
        </Tooltip>
      ) : (
        <RefTag
          color={memoizedColor}
          style={{ ...getStyle(style, data, globalState) }}
          icon={canShowIcon ? <Icon type={itemData?.icon} /> : null}
        >
          {showReflistName && itemData?.item}
        </RefTag>
      )}
    </div>
  );
};

const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};

export default RefListStatusControl;
