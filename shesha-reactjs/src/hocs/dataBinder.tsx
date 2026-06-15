import React, { ReactNode } from 'react';
import { IConfigurableFormItemChildFunc } from '@/components/formDesigner/components/model';

export type IDataBinderProps<TValue = unknown> = {
  value?: TValue | undefined;
  onChange?: ((newValue: TValue | null) => void) | undefined;
  children: IConfigurableFormItemChildFunc<TValue>;
  valuePropName?: string | undefined;
};

const emptyOnChange = (): void => {
  throw new Error('DataBinder: onChange must be injected by upstream component');
};

const DataBinder = <TValue = unknown>(props: IDataBinderProps<TValue>): ReactNode => {
  const { onChange = emptyOnChange, valuePropName } = props;

  if (valuePropName) {
    const effectiveValue = props[valuePropName as keyof typeof props] as TValue;
    return (<>{props.children(effectiveValue, onChange)}</>);
  }

  const { value } = props;
  return (<>{props.children(value, onChange)}</>);
};

export { DataBinder };
