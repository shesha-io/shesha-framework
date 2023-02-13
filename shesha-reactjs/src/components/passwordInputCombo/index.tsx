import { Form, FormItemProps, FormProps, Input, InputProps, Popover } from 'antd';
import React, { FC, useEffect } from 'react';
import { ConfimPasswordChecklist } from './confimPasswordChecklist';
import { PasswordChecklist } from './passwordChecklist';
import { PasswordComboWrapper } from './passwordComboWrapper';
import { confirmPasswordValidations, isSamePassword, passwordValidations } from './utils';

const { Password } = Input;

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
type EventSetType = 'value' | 'event';

interface IProps {
  readonly newPassword: string;
  readonly repeatPassword: string;
  readonly setNewPassword: (value: string | ChangeEvent) => void;
  readonly setRepeatPassword: (value: string | ChangeEvent) => void;
  readonly isPasswordOk: (value: boolean) => void;
  readonly errorMessage?: string;
  readonly eventSetType?: EventSetType;
  readonly passwordLength?: number;

  readonly inputProps?: InputProps;
  readonly placeholder?: string;
  readonly confirmPlaceholder?: string;
  readonly formProps?: FormProps;
  readonly formItemProps?: FormItemProps;
  readonly formItemConfirmProps?: FormItemProps;
}

const FormItem = Form.Item;

const PasswordInputCombo: FC<IProps> = ({
  newPassword,
  repeatPassword,
  setNewPassword,
  setRepeatPassword,
  isPasswordOk,
  errorMessage,
  eventSetType = 'value',
  passwordLength = 4,
  inputProps,
  placeholder,
  confirmPlaceholder,
  formProps,
  formItemProps,
  formItemConfirmProps,
}) => {
  useEffect(() => isPasswordOk(isSamePassword(newPassword, repeatPassword, passwordLength)), [
    newPassword,
    repeatPassword,
  ]);

  const getValue = (e: ChangeEvent) => (eventSetType === 'event' ? e : e.target.value);

  const onPasswordChange = (e: ChangeEvent) => setNewPassword(getValue(e));
  const onConfirmPasswordChange = (e: ChangeEvent) => setRepeatPassword(getValue(e));

  return (
    <PasswordComboWrapper formProps={formProps}>
      <Popover
        placement="top"
        title="The password must contain the following conditions"
        content={<PasswordChecklist password={newPassword} passwordLength={passwordLength} />}
        trigger="focus"
      >
        <FormItem {...formItemProps} {...passwordValidations(newPassword, errorMessage, passwordLength)}>
          <Password {...inputProps} placeholder={placeholder} value={newPassword} onChange={onPasswordChange} />
        </FormItem>
      </Popover>

      <Popover
        placement="top"
        content={<ConfimPasswordChecklist password={newPassword} confirmPassword={repeatPassword} />}
        trigger="focus"
      >
        <FormItem
          {...(formItemConfirmProps || formItemProps)}
          {...confirmPasswordValidations(newPassword, repeatPassword, errorMessage)}
        >
          <Password
            {...inputProps}
            placeholder={confirmPlaceholder}
            value={repeatPassword}
            onChange={onConfirmPasswordChange}
          />
        </FormItem>
      </Popover>
    </PasswordComboWrapper>
  );
};

export default PasswordInputCombo;
