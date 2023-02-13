export const SpecificationType = {
  jsType: 'boolean',
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'is_satisfied',
  widgets: {
    specification: {
      operators: ['is_satisfied', 'is_satisfied_conditional'],
    },
  },
};

export default SpecificationType;
