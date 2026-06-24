import React, { ReactNode } from "react";
import { Form, FormItemProps } from "antd";
import { IConfigurableFormItemChildFunc } from "./model";
import { DataBinder } from "@/hocs/dataBinder";
import { EventsAndApiValueProcessor } from "./eventsAndApiValueProcessor";

export interface IConfigurableFormItem_FormProps<TValue = unknown> {
  formItemProps: FormItemProps;
  readonly children: IConfigurableFormItemChildFunc<TValue>;
  valuePropName?: string | undefined;
  componentName: string;
  componentId: string;
}

export const ConfigurableFormItemForm = <TValue = unknown>(props: IConfigurableFormItem_FormProps<TValue>): ReactNode => {
  const { formItemProps, children, valuePropName, componentName, componentId } = props;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder<TValue> valuePropName={valuePropName}>
        {(value, onChange, propertyName) => (
          <EventsAndApiValueProcessor value={value} onChange={onChange} componentName={componentName} propertyName={propertyName} componentId={componentId}>
            {children}
          </EventsAndApiValueProcessor>
        )}
      </DataBinder>
    </Form.Item>
  );
};
