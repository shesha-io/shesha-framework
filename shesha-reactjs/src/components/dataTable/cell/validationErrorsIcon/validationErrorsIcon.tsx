import { WarningTwoTone } from '@ant-design/icons';
import { Popover } from 'antd';
import React, { FC } from 'react';
import { IErrorInfo } from '../../../../interfaces/errorInfo';

export interface IValidationErrorsIconProps {
  error?: IErrorInfo;
}

export const ValidationErrorsIcon: FC<IValidationErrorsIconProps> = ({ error }) => {
  if (!error) return null;

  const { message, details } = error;
  return (
    <Popover title={message} content={<>{details}</>} trigger="hover" placement="topLeft">
      <WarningTwoTone twoToneColor="red" />
    </Popover>
  );
};

export default ValidationErrorsIcon;
