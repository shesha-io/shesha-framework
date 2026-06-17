import { GetAvailableConstantsFunc } from "@/designer-components/codeEditor/interfaces";
import { IComponentModelProps } from "@/providers/form/models";
import { ColProps, RadioChangeEvent } from "antd";
import { ReactNode, SyntheticEvent } from "react";

type ConfigurableFormItemContext<TValue = unknown> = {
  handleEvent: <TEvent = SyntheticEvent | RadioChangeEvent>(event: TEvent | undefined, value: TValue, expression: string | undefined) => void;
};

export type IConfigurableFormItemChildFunc<TValue = unknown> = (
  value: TValue | null | undefined,
  onChange: ((newValue: TValue | null) => void),
  propertyName?: string | undefined,
  ctx?: ConfigurableFormItemContext,
) => ReactNode;

export interface IConfigurableFormItemProps<TValue = unknown> {
  model: IComponentModelProps;
  readonly children?: ReactNode | IConfigurableFormItemChildFunc<TValue>;
  className?: string | undefined;
  valuePropName?: string | undefined;
  initialValue?: TValue | undefined;
  customVisibility?: string | undefined;
  wrapperCol?: ColProps | undefined;
  labelCol?: ColProps | undefined;
  hidden?: boolean | undefined;
  autoAlignLabel?: boolean | undefined;
  lazy?: boolean | undefined;
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
}
