import { IConfigurableFormComponent } from "@/index";
import { ColProps } from "antd";
import { ReactNode } from "react";

export type IConfigurableFormItemChildFunc = (
  value: any,
  onChange: (...args: any[]) => void,
  propertyName?: string
) => ReactNode;

export interface IConfigurableFormItemProps {
  model: IConfigurableFormComponent;
  readonly children?: ReactNode | IConfigurableFormItemChildFunc;
  className?: string;
  valuePropName?: string;
  initialValue?: any;
  customVisibility?: string;
  wrapperCol?: ColProps;
  labelCol?: ColProps;
  hidden?: boolean;
}