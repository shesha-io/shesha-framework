import { Type } from '@react-awesome-query-builder/antd';

export const RefListType: Type = {
  valueSources: ['value', 'func'],
  defaultOperator: 'equal',
  widgets: {
    refListDropdown: {
      operators: ['equal'],
    },
  },
};

export default RefListType;
