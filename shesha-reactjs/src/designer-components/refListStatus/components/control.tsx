import React, { FC } from 'react';
import { FormMode, useForm, useGlobalState } from 'providers';
import '../styles/index.less';
import { IRefListStatusProps } from '../models';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Alert, Skeleton, Tag, Tooltip } from 'antd';
import { getStyle } from 'utils/publicUtils';
import ToolTipTittle from './tooltip';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useReferenceListItem } from 'providers/referenceListDispatcher';

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
      <Alert showIcon message="Something went during Reflists fetch" description={listItem.error.message} type="error" />
    );
  }

  console.log('LOG: listItem', {
    listItem,
    value, 
    referenceListId
  });

  const itemData = listItem?.data;

  const memoizedColor = solidBackground
    ? convertCssColorNameToHex(itemData?.color ?? '')
    : itemData?.color?.toLowerCase();

  const canShowIcon = showIcon && itemData?.icon;

  if (!itemData?.itemValue && !listItem?.loading) return null;

  return (
    <Skeleton loading={listItem?.loading}>
      <div className='sha-status-tag-container'>
        <Tag
          className="sha-status-tag"
          color={memoizedColor}
          style={{ ...getStyle(style, data, globalState) }}
          icon={canShowIcon ? <Icon type={itemData?.icon} /> : null}
        >
          {showReflistName && itemData?.item}
        </Tag>
        {(((itemData?.description && showReflistName) ||
          (!showReflistName && (itemData?.item || itemData?.description))) &&
          (
            <Tooltip
              placement="rightTop"
              title={<ToolTipTittle showReflistName={showReflistName} currentStatus={itemData} />}
            >

              <QuestionCircleOutlined className='sha-help-icon' />

            </Tooltip>
          ))}
      </div>
    </Skeleton>
  );
};

const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};

export default RefListStatusControl;
