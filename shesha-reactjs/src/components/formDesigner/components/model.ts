import { GetAvailableConstantsFunc } from "@/designer-components/codeEditor/interfaces";
import { IComponentModelProps } from "@/providers/form/models";
import { ColProps } from "antd";
import { ReactNode } from "react";

export type IConfigurableFormItemChildFunc = (
  value: any,
  onChange: (...args: any[]) => void,
  propertyName?: string,
) => ReactNode;

export interface IConfigurableFormItemProps {
  model: IComponentModelProps;
  readonly children?: ReactNode | IConfigurableFormItemChildFunc;
  className?: string | undefined;
  valuePropName?: string | undefined;
  initialValue?: any | undefined;
  customVisibility?: string | undefined;
  wrapperCol?: ColProps | undefined;
  labelCol?: ColProps | undefined;
  hidden?: boolean;
  autoAlignLabel?: boolean | undefined;
  lazy?: boolean | undefined;
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
}
