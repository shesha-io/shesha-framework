import { Type } from '@react-awesome-query-builder/antd';

export const EntityReferenceType: Type = {
  valueSources: ['value', 'func'],
  defaultOperator: 'equal',
  mainWidget: 'entityAutocomplete',
  widgets: {
    entityAutocomplete: {
      operators: ['equal', 'is_null', 'is_not_null'],
    },
  },
};

export default EntityReferenceType;
