import { Type } from '@react-awesome-query-builder/antd';

export const SpecificationType: Type = {
  valueSources: ['value'],
  defaultOperator: 'is_satisfied',
  widgets: {
    specification: {
      operators: ['is_satisfied', 'is_satisfied_conditional'],
    },
  },
};
