import { getDataProperty, getFormatContent } from '@/utils/metadata';

export const innerEntityReferenceSpanBoxStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
  margin: '0',
  padding: '0',
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