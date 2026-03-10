import { Type, AntdConfig } from '@react-awesome-query-builder/antd';

export const StrictBoolean: Type = {
  ...AntdConfig.types.boolean,
  valueSources: ['value'],
  widgets: {
    boolean: {
      operators: ['equal'],
      widgetProps: {
        hideOperator: true,
        operatorInlineLabel: "returns",
        labelYes: 'true',
        labelNo: 'false',
      },
    },
  },
};
