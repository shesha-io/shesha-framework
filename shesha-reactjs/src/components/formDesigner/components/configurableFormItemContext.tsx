import React, { FC, useCallback } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";
import { useDataContextManager } from "@/providers/dataContextManager/hooks";
import { ComponentApiValueProcessor } from "./componentApiValueProcessor";

interface IConfigurableFormItem_ContextProps {
  componentId: string;
  formItemProps: FormItemProps;
  valuePropName?: string;
  componentName: string;
  propertyName: string;
  contextName: string;
  readonly children?: IConfigurableFormItemChildFunc;
}

export const ConfigurableFormItemContext: FC<IConfigurableFormItem_ContextProps> = (props) => {
  const { componentId, formItemProps, valuePropName, componentName, propertyName, contextName, children } = props;
  const { getDataContext } = useDataContextManager();
  const { getFieldValue, setFieldValue } = getDataContext(contextName) ?? {};

  const value = getFieldValue?.(propertyName);
  const onChange = useCallback((val: any): void => {
    const newValue = val?.target ? val?.target[valuePropName || 'value'] : val;
    setFieldValue?.(propertyName as "", newValue as never);
  }, [valuePropName, setFieldValue, propertyName]);

  return (
    <Form.Item {...formItemProps}>
      <DataBinder
        onChange={onChange}
        value={value}
      >
        {(value, onChange, propertyName) => (
          <ComponentApiValueProcessor value={value} onChange={onChange} componentName={componentName} propertyName={propertyName} componentId={componentId}>
            {children}
          </ComponentApiValueProcessor>
        )}
      </DataBinder>
    </Form.Item>
  );
};
