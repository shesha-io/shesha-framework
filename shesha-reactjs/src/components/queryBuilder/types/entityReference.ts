import { Type } from '@react-awesome-query-builder/antd';

export const EntityReferenceType: Type = {
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  mainWidget: 'entityAutocomplete',
  widgets: {
    entityAutocomplete: {
      operators: ['equal', 'not_equal', 'is_null', 'is_not_null'],
    },
  },
};
