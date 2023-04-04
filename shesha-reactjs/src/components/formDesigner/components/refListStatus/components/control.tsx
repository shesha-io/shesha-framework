import React, { FC, useEffect } from 'react';
import { FormMode, useForm } from '../../../../../providers';
import '../styles/index.less';
import { IRefListStatusProps } from '../models';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Alert, Skeleton, Tag, Tooltip } from 'antd';
import { getStyle } from '../../../../../utils/publicUtils';
import { useReferenceListGetByName } from '../../../../../apis/referenceList';
import { getCurrentStatus } from '../utilis';
import ToolTipTittle from './tooltip';

interface IProps {
  formMode?: FormMode;
  model: IRefListStatusProps;
  onChange?: Function;
  value?: any;
}

const RefListStatusControl: FC<IProps> = ({ model }) => {
  const { formData: data, formMode } = useForm();
  const { module, nameSpace, showIcon, solidBackground, style, name, showReflistName } = model;

  const {
    data: refListData,
    error: RefListError,
    loading: isFetchingRefListData,
    refetch: getRefListHttp,
  } = useReferenceListGetByName({
    lazy: true,
    queryParams: { module, name: nameSpace },
  });

  useEffect(() => {
    getRefListHttp();
  }, []);

  if (!!RefListError && !isFetchingRefListData) {
    return (
      <Alert showIcon message="Something went during Reflists fetch" description={RefListError.message} type="error" />
    );
  }

  const currentStatus = getCurrentStatus(refListData?.result, data, formMode, name);

  const memoizedColor = solidBackground
    ? convertCssColorNameToHex(currentStatus?.color ?? '')
    : currentStatus?.color?.toLowerCase();

  const canShowIcon = showIcon && currentStatus?.icon;

  if (!currentStatus?.itemValue && refListData?.success) return null;

  return (
    <Skeleton loading={isFetchingRefListData}>
      <Tooltip
        placement="rightTop"
        title={<ToolTipTittle showReflistName={showReflistName} currentStatus={currentStatus} />}
      >
        <Tag
          className="sha-status-tag"
          color={memoizedColor}
          style={{ ...getStyle(style, data) }}
          icon={canShowIcon ? <Icon type={currentStatus?.icon} /> : null}
        >
          {showReflistName && currentStatus?.item}
        </Tag>
      </Tooltip>
    </Skeleton>
  );
};

const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};

export default RefListStatusControl;
