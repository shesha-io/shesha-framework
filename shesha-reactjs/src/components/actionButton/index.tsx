import { Button, Popconfirm, Popover } from 'antd';
import React, { FC } from 'react';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { ButtonShape, ButtonType } from 'antd/es/button/buttonHelpers';

export interface IActionButtonProps {
  type?: ButtonType;
  shape?: ButtonShape;
  title: string;
  icon?: React.ReactNode;
  executer: () => void;
  confirmationText?: string;
  isVisible: boolean;
  loading?: boolean;
  error?: IErrorInfo;
}

const ActionButton: FC<IActionButtonProps> = ({
  icon,
  title,
  executer,
  confirmationText,
  loading,
  error,
  type = 'link',
  shape = 'circle',
}) => {
  const mustConfirm = Boolean(confirmationText);
  const button = (
    <Button
      type={type}
      shape={shape}
      icon={icon}
      onClick={
        mustConfirm
          ? undefined
          : (e) => {
            e.stopPropagation();
            executer();
          }
      }
      title={title}
      loading={loading}
      danger={Boolean(error)}
      className="sha-link sha-action-button"
    />
  );

  const withConfirmation = confirmationText ? (
    <Popconfirm title={confirmationText} onConfirm={() => executer()}>
      {button}
    </Popconfirm>
  ) : (
    button
  );

  return error ? (
    <Popover title={error.message} content={<>{error.details}</>} trigger="hover" placement="topLeft">
      {withConfirmation}
    </Popover>
  ) : (
    <>{withConfirmation}</>
  );
};

export default ActionButton;
