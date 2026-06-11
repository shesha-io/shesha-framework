import React, { ReactNode } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";

export interface IConfigurableFormItem_FormProps<TValue = unknown> {
  formItemProps: FormItemProps;
  readonly children: IConfigurableFormItemChildFunc<TValue>;
  valuePropName?: string | undefined;
}

export const ConfigurableFormItemForm = <TValue = unknown>(props: IConfigurableFormItem_FormProps<TValue>): ReactNode => {
  const {
    formItemProps,
    children,
    valuePropName,
  } = props;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder<TValue> valuePropName={valuePropName}>
        {children}
      </DataBinder>
    </Form.Item>
  );
};
