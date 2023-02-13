export const DateTimeDynamicType = {
  jsType: 'string',
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  widgets: {
    dateTimeDynamic: {
      operators: [
        'equal',
        'not_equal',
        'less',
        'less_or_equal',
        'greater',
        'greater_or_equal',
        'between',
        'not_between',
        'is_empty',
        'is_not_empty',
      ],

      opProps: {
        between: {
          isSpecialRange: true,
          textSeparators: [null, null],
        },
        not_between: {
          isSpecialRange: true,
          textSeparators: [null, null],
        },
        operators: [
          'equal',
          'not_equal',
          'less',
          'less_or_equal',
          'greater',
          'greater_or_equal',
          'between',
          'not_between',
          'is_empty',
          'is_not_empty',
        ],
      },
    },
  },
};

export default DateTimeDynamicType;
