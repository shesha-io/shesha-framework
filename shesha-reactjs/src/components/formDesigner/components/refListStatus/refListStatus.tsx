import React, { FC, useEffect, useMemo } from 'react';
import { FormMode, useForm } from '../../../../providers';
import './styles/index.less';
import { IRefListStatusProps } from './models';
import convertCssColorNameToHex from 'convert-css-color-name-to-hex';
import { Alert, Tag } from 'antd';
import { getStyle } from '../../../../utils/publicUtils';
import { ReferenceListItemDto, useReferenceListGetByName } from '../../../../apis/referenceList';

interface IProps {
  formMode?: FormMode;
  model: IRefListStatusProps;
  onChange?: Function;
  value?: any;
}

const RefListStatus: FC<IProps> = ({ model }) => {
  const { formData: data } = useForm();
  const { module, nameSpace, showIcon, solidBackground, style, name } = model;

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

  const currentStatus: ReferenceListItemDto = useMemo(() => {
    model.description = refListData?.result?.description;
    return !refListData?.result?.items?.length || data[name] === null || data[name] === undefined
      ? null
      : refListData?.result?.items?.find(i => i.itemValue == data[name]);
  }, [refListData]);

  const memoizedColor = useMemo(() => {
    return solidBackground ? convertCssColorNameToHex(currentStatus?.color ?? '') : currentStatus?.color.toLowerCase();
  }, [solidBackground, currentStatus]);

  const canShowIcon = useMemo(() => {
    return showIcon && currentStatus?.icon;
  }, [currentStatus, showIcon]);

  return (
    <Tag
      className="sha-status-tag"
      color={memoizedColor}
      style={{ ...getStyle(style, data) }}
      icon={canShowIcon ? <Icon type={currentStatus?.icon} /> : null}
    >
      {currentStatus?.item}
    </Tag>
  );
};

const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;
};

export { RefListStatus };
