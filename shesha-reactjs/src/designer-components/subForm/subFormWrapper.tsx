import React, { FC } from 'react';
import SubForm from './subForm';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IStylable } from '@/interfaces';
import { ISubFormProviderProps } from '@/providers/subForm/interfaces';
import { SubFormProvider, UnwrapCodeEvaluators } from '@/providers';

export interface ISubFormComponentProps
  extends Omit<ISubFormProviderProps, 'labelCol' | 'wrapperCol' | 'readOnly'>,
  IConfigurableFormComponent {
  labelCol?: number;
  wrapperCol?: number;
  queryParams?: ISubFormProviderProps['queryParams'];
}

interface ISubFormWrapperProps
  extends Omit<ISubFormComponentProps, 'id' | 'type' | 'style' | 'labelCol' | 'wrapperCol'>,
  IStylable {
  id: string;
}

export const SubFormWrapper: FC<UnwrapCodeEvaluators<ISubFormWrapperProps>> = ({ style, ...props }) => {
  return (
    <SubFormProvider {...props as any} key={props.id}>
      <SubForm style={style} readOnly={props.readOnly} />
    </SubFormProvider>
  );
};
