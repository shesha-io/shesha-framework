import React, { ReactNode } from 'react';
import { IConfigurableFormItemChildFunc } from '@/components/formDesigner/components/model';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

export type IDataBinderProps<TValue = unknown> = {
  value?: TValue | undefined;
  onChange?: ((newValue: TValue | undefined | null) => void) | undefined;
  children: IConfigurableFormItemChildFunc<TValue>;
  valuePropName?: string | undefined;
};

const emptyOnChange = (): void => {
  throw new Error('DataBinder: onChange must be injected by upstream component');
};

const DataBinder = <TValue = unknown>(props: IDataBinderProps<TValue>): ReactNode => {
  const { onChange = emptyOnChange, valuePropName } = props;

  if (isNotNullOrWhiteSpace(valuePropName)) {
    const effectiveValue = props[valuePropName as keyof typeof props] as TValue;
    return (<>{props.children(effectiveValue, onChange)}</>);
  }

  const { value } = props;
  return (<>{props.children(value, onChange)}</>);
};

export { DataBinder };
