import React from 'react';
import { Spin } from 'antd';
import { getDataProperty, getFormatContent } from '@/utils/metadata';

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    md: { span: 8 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    md: { span: 16 },
    sm: { span: 16 },
  },
};

export const loadingBox = (cx: (className: string) => string, styles: { innerEntityReferenceSpanBoxStyle: string; spin: string; inlineBlock: string }) => (
  <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>
    <Spin size="small" className={cx(styles.spin)} />
    <span className={cx(styles.inlineBlock)}>Loading...</span>
  </span>
);

export const innerEntityReferenceButtonBoxStyle = {
  backgroundColor: 'transparent',
  whiteSpace:  'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
  height: '100%',
  margin: '0',
  padding: '0',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
};  

export const compareValueToProperty = (key: string, value: string, properties: Array<{ [key in string]: any }>) => {
  const dataType = getDataProperty(properties, key, 'dataType');
  const dataFormat = getDataProperty(properties, key, 'dataFormat');

  return [key, getFormatContent(value, { dataType, dataFormat })];
};

export const getQuickViewInitialValues = (
  data: { [key in string]: any },
  properties: Array<{ [key in string]: any }>
) =>
  Object.entries(data || {})
    .map(([key, value]) => compareValueToProperty(key, value, properties))
    .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {});
