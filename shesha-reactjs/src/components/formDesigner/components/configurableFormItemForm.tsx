import React, { FC } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";
import { ComponentApiValueProcessor } from "./componentApiValueProcessor";

export interface IConfigurableFormItem_FormProps {
  formItemProps: FormItemProps;
  readonly children?: IConfigurableFormItemChildFunc;
  valuePropName?: string;
  componentName: string;
  componentId: string;
}

export const ConfigurableFormItemForm: FC<IConfigurableFormItem_FormProps> = (props) => {
  const { formItemProps, children, valuePropName, componentName, componentId } = props;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder valuePropName={valuePropName}>
        {(value, onChange, propertyName) => (
          <ComponentApiValueProcessor value={value} onChange={onChange} componentName={componentName} propertyName={propertyName} componentId={componentId}>
            {children}
          </ComponentApiValueProcessor>
        )}
      </DataBinder>
    </Form.Item>
  );
};
