import { Form, FormItemProps, FormProps, Input, InputProps, Popover } from 'antd';
import React, { FC, useEffect } from 'react';
import { ConfimPasswordChecklist } from './confimPasswordChecklist';
import { PasswordChecklist } from './passwordChecklist';
import { PasswordComboWrapper } from './passwordComboWrapper';
import { confirmPasswordValidations, isSamePassword, passwordValidations } from './utils';

const { Password } = Input;

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface IProps {
  readonly newPassword: string;
  readonly repeatPassword: string;
  readonly setNewPassword: (value: string) => void;
  readonly setRepeatPassword: (value: string) => void;
  readonly isPasswordOk: (value: boolean) => void;
  readonly errorMessage?: string | undefined;
  readonly passwordLength?: number | undefined;

  readonly inputProps?: InputProps | undefined;
  readonly placeholder?: string | undefined;
  readonly confirmPlaceholder?: string | undefined;
  readonly formProps?: FormProps | undefined;
  readonly formItemProps?: FormItemProps | undefined;
  readonly formItemConfirmProps?: FormItemProps | undefined;
  readonly style?: React.CSSProperties | undefined;
  readonly repeatPropertyName?: string | undefined;
}

const FormItem = Form.Item;

const PasswordInputCombo: FC<IProps> = ({
  newPassword,
  repeatPassword,
  setNewPassword,
  setRepeatPassword,
  isPasswordOk,
  errorMessage,
  passwordLength = 4,
  inputProps,
  placeholder,
  confirmPlaceholder,
  formProps,
  formItemProps,
  formItemConfirmProps,
  style,
  repeatPropertyName,
}) => {
  useEffect(() => isPasswordOk(isSamePassword(newPassword, repeatPassword, passwordLength)), [isPasswordOk, newPassword, passwordLength, repeatPassword]);

  const onPasswordChange = (e: ChangeEvent): void => setNewPassword(e.target.value);
  const onConfirmPasswordChange = (e: ChangeEvent): void => setRepeatPassword(e.target.value);

  return (
    <PasswordComboWrapper formProps={formProps}>
      <Popover
        placement="top"
        title="The password must contain the following conditions"
        content={<PasswordChecklist password={newPassword} passwordLength={passwordLength} />}
        trigger="focus"
      >
        <FormItem {...formItemProps} {...passwordValidations(newPassword, errorMessage, passwordLength)}>
          <Password {...inputProps} placeholder={placeholder} autoComplete="new-password" value={newPassword} onChange={onPasswordChange} style={style} />
        </FormItem>
      </Popover>

      <Popover
        placement="top"
        content={<ConfimPasswordChecklist password={newPassword} confirmPassword={repeatPassword} />}
        trigger="focus"
      >
        <FormItem
          {...(formItemConfirmProps || formItemProps)}
          name={repeatPropertyName ?? (formItemProps?.name ? String(formItemProps.name) : '')}
          {...confirmPasswordValidations(newPassword, repeatPassword, errorMessage)}
        >
          <Password
            {...inputProps}
            autoComplete="new-password"
            placeholder={confirmPlaceholder}
            value={repeatPassword}
            style={style}
            onChange={onConfirmPasswordChange}
          />
        </FormItem>
      </Popover>
    </PasswordComboWrapper>
  );
};

export default PasswordInputCombo;
