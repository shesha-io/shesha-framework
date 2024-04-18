import { getDataProperty, getFormatContent } from '@/utils/metadata';

export const compareValueToProperty = async (key: string, value: string, properties: Array<{ [key in string]: any }>) => {
  const dataType = await getDataProperty(properties, key, null, 'dataType');
  const dataFormat = await getDataProperty(properties, key, null, 'dataFormat');

  return [key, getFormatContent(value, { dataType, dataFormat })];
};

export const getQuickViewInitialValues = async (
  data: { [key in string]: any },
  properties: Array<{ [key in string]: any }>
) => {
  const entries = Object.entries(data || {});
  const resultPromises = entries.map(([key, value]) => compareValueToProperty(key, value, properties));
  const results = await Promise.all(resultPromises);
  
  return results.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};