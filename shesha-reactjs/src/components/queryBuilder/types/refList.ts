export const RefListType = {
  jsType: 'number',
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  widgets: {
    refListDropdown: {
      operators: ['equal'],
      /*
            widgetProps: {
                // valuePlaceholder: "Time",
                // timeFormat: 'h:mm:ss A',
                // use12Hours: true,
            },
            opProps: {
                // between: {
                //     valueLabels: ['Time from', 'Time to'],
                // },
            },
            */
    },
  },
};

export default RefListType;
