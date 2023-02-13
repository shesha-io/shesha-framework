import { FormItemProps, FormProps, InputProps } from 'antd';
import React, { FC, useState } from 'react';
import PasswordInputCombo from '../../../passwordInputCombo';

interface IProps {
  readonly confirmPlaceholder: string;
  readonly errorMessage?: string;
  readonly formItemProps: FormItemProps;
  readonly formItemConfirmProps?: FormItemProps;
  readonly formProps?: FormProps;
  readonly inputProps: InputProps;
  readonly passwordLength: number;
  readonly placeholder: string;
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
}) => {
  const [state, setState] = useState<IState>(INIT_STATE);
  const { newPassword, repeatPassword } = state;

  const setNewPassword = (newPassword: string) => setState(s => ({ ...s, newPassword }));
  const setRepeatPassword = (repeatPassword: string) => setState(s => ({ ...s, repeatPassword }));

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
      isPasswordOk={_e => {}}
    />
  );
};

export default PasswordCombo;
