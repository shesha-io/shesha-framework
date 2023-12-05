import { Button, Popconfirm, Popover } from 'antd';
import React, { FC } from 'react';
import { IErrorInfo } from '../../interfaces/errorInfo';

export interface IActionButtonProps {
  title: string;
  icon?: React.ReactNode;
  executer: () => void;
  confirmationText?: string;
  isVisible: boolean;
  loading?: boolean;
  error?: IErrorInfo;
}
  
const ActionButton: FC<IActionButtonProps> = ({ icon, title, executer, confirmationText, loading, error }) => {
  const mustConfirm = Boolean(confirmationText);
  const button = (
    <Button
      type='link'
      shape="circle"
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
      className="sha-link"
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