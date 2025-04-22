import React, { FC } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";

export interface IConfigurableFormItem_FormProps {
  formItemProps: FormItemProps;
  readonly children?: IConfigurableFormItemChildFunc;
  valuePropName?: string;
}

export const ConfigurableFormItemForm: FC<IConfigurableFormItem_FormProps> = (props) => {
  const {
    formItemProps,
    children,
    valuePropName,
  } = props;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder valuePropName={valuePropName}>
        {children}
      </DataBinder>
    </Form.Item>
  );
};