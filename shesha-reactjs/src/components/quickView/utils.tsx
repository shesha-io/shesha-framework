import React, { ReactNode } from 'react';
import { Spin } from 'antd';
import { getDataProperty } from '@/utils/metadata';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { formatDateStringAndPrefix } from '@/utils/formatting';
import { numberToFormattedString } from '@/utils/string';
import { IAnyObject } from '@/interfaces';
import { isDefined } from '@/utils/nullables';

const getFormatContent = (content: string, dataType: string | undefined, dataFormat: string | undefined): string => {
  switch (dataType) {
    case 'boolean':
      return !!content ? 'Yes' : 'No';

    case 'date-time':
      return formatDateStringAndPrefix(content, dataFormat);

    case 'number':
      return numberToFormattedString(content, dataFormat || 'round');

    default:
      return content;
  }
};

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

export const loadingBox = (styles: { innerEntityReferenceSpanBoxStyle: string; spin: string; inlineBlock: string }): ReactNode => (
  <span className={styles.innerEntityReferenceSpanBoxStyle}>
    <Spin size="small" className={styles.spin} />
    <span className={styles.inlineBlock}>Loading...</span>
  </span>
);

export const innerEntityReferenceButtonBoxStyle = {
  backgroundColor: 'transparent',
  whiteSpace: 'nowrap',
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

export const compareValueToProperty = (key: string, value: string, properties: IPropertyMetadata[]): [key: string, value: string] => {
  const dataType = getDataProperty(properties, key, 'dataType');
  const dataFormat = getDataProperty(properties, key, 'dataFormat') ?? undefined;

  return [key, getFormatContent(value, dataType, dataFormat)];
};

export const getQuickViewInitialValues = (
  data: IAnyObject | undefined,
  properties: IPropertyMetadata[],
): { [key in string]: ReactNode } =>
  Object.entries(data ?? {})
    .map(([key, value]) => typeof (value) !== "object" ? compareValueToProperty(key, String(value), properties) : undefined)
    .filter(isDefined)
    .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {});
