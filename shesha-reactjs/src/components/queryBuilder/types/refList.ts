import { Type } from '@react-awesome-query-builder/antd';

export const RefListType: Type = {
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  widgets: {
    refListDropdown: {
      operators: ['equal', 'not_equal'],
    },
  },
};

export default RefListType;
