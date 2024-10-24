import React, { FC } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { Popover, Input, Form } from 'antd';
import { passwordValidations, confirmPasswordValidations } from './utils';
import PasswordChecklist from '../passwordChecklist';
import ConfirmPasswordChecklist from '../confirmPasswordChecklist';

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export interface IPasswordConfirmPassword {
  password: string;
  confirmPassword: string;
}

export interface IPasswordConfirmPasswordInputsProps {
  readonly password: string;
  readonly confirmPassword: string;
  readonly setPassword: (value: string) => void;
  readonly setConfirmPassword: (value: string) => void;
  readonly passwordName?: string;
  readonly confirmPasswordName?: string;
}

const FormItem = Form.Item;

const PasswordConfirmPasswordInputs: FC<IPasswordConfirmPasswordInputsProps> = ({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  passwordName = 'password',
  confirmPasswordName = 'confirmPassword',
}) => {
  const handlePasswordChange = (e: ChangeEvent) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: ChangeEvent) => setConfirmPassword(e.target.value);

  return (
    <>
      <FormItem {...passwordValidations(password)} name={passwordName} rules={[{ required: true }]}>
        <Popover
          placement="right"
          title="The password must contain the following conditions"
          content={<PasswordChecklist password={password} />}
          trigger="click"
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Popover>
      </FormItem>

      <FormItem
        {...confirmPasswordValidations(password, confirmPassword)}
        name={confirmPasswordName}
        rules={[{ required: true }]}
      >
        <Popover
          placement="right"
          content={<ConfirmPasswordChecklist password={password} confirmPassword={confirmPassword} />}
          trigger="click"
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </Popover>
      </FormItem>
    </>
  );
};

export default PasswordConfirmPasswordInputs;
