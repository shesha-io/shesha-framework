import { FormItemProps, FormProps, InputProps } from 'antd';
import React, { FC, useState } from 'react';
import PasswordInputCombo from '@/components/passwordInputCombo';

export interface IProps {
  readonly confirmPlaceholder: string | undefined;
  readonly errorMessage?: string | undefined;
  readonly formItemProps: FormItemProps;
  readonly formItemConfirmProps?: FormItemProps | undefined;
  readonly formProps?: FormProps | undefined;
  readonly inputProps: InputProps;
  readonly passwordLength: number | undefined;
  readonly placeholder?: string | undefined;
  readonly style?: React.CSSProperties | undefined;
  readonly className?: string | undefined;
  readonly repeatPropertyName?: string | undefined;
}

interface IState {
  readonly newPassword: string;
  readonly repeatPassword: string;
}

const INIT_STATE: IState = {
  newPassword: '',
  repeatPassword: '',
};

export const PasswordCombo: FC<IProps> = ({
  confirmPlaceholder,
  errorMessage,
  placeholder,
  inputProps,
  formItemProps,
  formItemConfirmProps,
  formProps,
  passwordLength,
  style,
  repeatPropertyName,
}) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { newPassword, repeatPassword } = state;

  const setNewPassword = (newPassword: string): void => setState((s) => ({ ...s, newPassword }));
  const setRepeatPassword = (repeatPassword: string): void => setState((s) => ({ ...s, repeatPassword }));

  return (
    <PasswordInputCombo
      newPassword={newPassword}
      repeatPassword={repeatPassword}
      setNewPassword={setNewPassword}
      setRepeatPassword={setRepeatPassword}
      inputProps={inputProps}
      placeholder={placeholder}
      confirmPlaceholder={confirmPlaceholder}
      formItemProps={formItemProps}
      formItemConfirmProps={formItemConfirmProps}
      formProps={formProps}
      passwordLength={passwordLength}
      errorMessage={errorMessage}
      isPasswordOk={(_e) => { /* nop*/ }}
      style={style}
      repeatPropertyName={repeatPropertyName}
    />
  );
};

export default PasswordCombo;
