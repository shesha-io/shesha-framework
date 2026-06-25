import { GetAvailableConstantsFunc } from "@/designer-components/codeEditor/interfaces";
import { IComponentModelProps } from "@/providers/form/models";
import { ColProps, RadioChangeEvent } from "antd";
import { ReactNode, SyntheticEvent } from "react";

type EventValue<TValue = unknown> = {
  value?: TValue | undefined | null;
  [key: string]: unknown;
};

export type HandleEvent<TValue = unknown> = <TEvent extends SyntheticEvent | RadioChangeEvent = SyntheticEvent | RadioChangeEvent>(
  event: TEvent | undefined,
  value: EventValue<TValue>,
  expression: string | undefined,
  eventName?: string | undefined,
) => void;

export type ConfigurableFormItemContext<TValue = unknown> = {
  handleEvent: HandleEvent<TValue>;
};

export type IConfigurableFormItemChildFunc<TValue = unknown> = (
  value: TValue | undefined | null,
  onChange: ((newValue: TValue | undefined | null) => void),
  propertyName?: string | undefined,
  ctx?: ConfigurableFormItemContext<TValue>,
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
