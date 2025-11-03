import React, { FC } from 'react';
import {
  SaveOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  ButtonProps,
} from 'antd';
import { useModelConfigurator } from '@/index';

export interface ISaveButtonProps extends Pick<ButtonProps, 'size' | 'type'> {
  onSaved?: () => void;
}

export const SaveButton: FC<ISaveButtonProps> = (props) => {
  const configurator = useModelConfigurator();
  const { message } = App.useApp();
  const isModified = true;

  const onSaveClick = (): void => {
    message.loading('Saving model..', 0);
    configurator.saveForm()
      .then(() => {
        message.destroy();

        if (props.onSaved)
          props.onSaved();
        else {
          message.success('Model saved successfully');
        }
      })
      .catch(() => {
        message.destroy();
        message.error('Failed to save model');
      });
  };

  return (
    <Button
      icon={<SaveOutlined />}
      onClick={onSaveClick}
      type={props.type}
      size={props.size}
      disabled={!isModified}
    />
  );
};
