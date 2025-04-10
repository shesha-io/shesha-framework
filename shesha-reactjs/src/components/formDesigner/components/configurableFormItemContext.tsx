import React, { FC } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { useDataContextManager } from "@/index";
import { DataBinder } from "@/hocs/dataBinder";

interface IConfigurableFormItem_ContextProps {
  componentId: string;
  formItemProps: FormItemProps;
  valuePropName?: string;
  propertyName: string;
  contextName: string;
  readonly children?: IConfigurableFormItemChildFunc;
}

export const ConfigurableFormItemContext: FC<IConfigurableFormItem_ContextProps> = (props) => {
  const {
    formItemProps,
    valuePropName,
    propertyName,
    contextName,
    children
  } = props;
  const { getDataContext } = useDataContextManager();
  const context = getDataContext(contextName);
  const { getFieldValue } = context ?? {};

  const value = getFieldValue ? getFieldValue(propertyName) : undefined;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder
        onChange={(val) => {
          const value = val?.target ? val?.target[valuePropName || 'value'] : val;
          if (context?.setFieldValue)
            context.setFieldValue(propertyName, value);
        }}
        value={value}
      >
        {children}
      </DataBinder>
    </Form.Item>
  );
};