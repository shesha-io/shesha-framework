export const EntityReferenceType = {
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  widgets: {
    entityAutocomplete: {
      operators: ['equal', 'is_null', 'is_not_null'],
    },
  },
};

export default EntityReferenceType;
