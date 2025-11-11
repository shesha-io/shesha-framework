import React, { FC } from 'react';
import {
  SaveOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  ButtonProps,
} from 'antd';
import { useFormDesigner, useFormDesignerIsModified } from '@/providers/formDesigner';

export interface ISaveButtonProps extends Pick<ButtonProps, 'size' | 'type'> {
  onSaved?: () => void;
}

export const SaveButton: FC<ISaveButtonProps> = (props) => {
  const formDesigner = useFormDesigner();
  const isModified = useFormDesignerIsModified();
  const { message } = App.useApp();

  const saveFormInternal = (): Promise<void> => {
    return formDesigner.saveAsync();
  };

  const onSaveClick = (): void => {
    message.loading('Saving..', 0);
    saveFormInternal()
      .then(() => {
        message.destroy();

        if (props.onSaved)
          props.onSaved();
        else {
          message.success('Form saved successfully');
        }
      })
      .catch(() => {
        message.destroy();
        message.error('Failed to save form');
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
