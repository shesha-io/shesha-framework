import { Type, AntdConfig } from '@react-awesome-query-builder/antd';

const standardTypes = AntdConfig.types;

export type CustomType = Type & {
  operators?: string[];
};

export const GuidType: CustomType = {
  ...standardTypes.text,
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  operators: [
    'equal',
    'not_equal',
    'is_empty',
    'is_not_empty',
  ],
};

export default GuidType;
