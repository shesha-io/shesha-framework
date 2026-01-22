import React, { FC } from 'react';
import { editorRegistry } from './wrappers';
import { BaseInputProps } from '../settingsInput/interfaces';
import { useShaFormInstance } from '@/providers';

export const InputComponent: FC<BaseInputProps> = (props) => {
  const Editor = editorRegistry[props.type] as FC<BaseInputProps>;

  const { formData, setFormData } = useShaFormInstance();
  const { onChange, onChangeSetting } = props;
  const internalOnChange = (v: any): void => {
    onChangeSetting?.(v, formData, setFormData);
    onChange?.(v);
  };
  const newProps = { ...props, onChange: internalOnChange };

  return Editor ? <Editor {...newProps} /> : undefined;
};
