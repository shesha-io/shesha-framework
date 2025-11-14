import React, { FC, useCallback, useState } from 'react';
import { Button } from 'antd';
import { FormSettingsEditor } from '../formSettingsEditor';
import { SettingOutlined } from '@ant-design/icons';
import { useFormDesignerReadOnly } from '@/providers/formDesigner';
import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface IFormSettingsButtonProps {
  buttonText?: string;
  size?: SizeType;
}

export const FormSettingsButton: FC<IFormSettingsButtonProps> = ({ buttonText, size }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const readOnly = useFormDesignerReadOnly();

  const onSettingsClick = (): void => {
    setSettingsVisible(true);
  };
  const onClose = useCallback(() => {
    setSettingsVisible(false);
  }, [setSettingsVisible]);

  return (
    <>
      <Button icon={<SettingOutlined />} size={size} onClick={onSettingsClick} title="Form Settings">
        {buttonText !== undefined ? buttonText : "Settings"}
      </Button>
      <FormSettingsEditor
        readOnly={readOnly}
        isVisible={settingsVisible}
        close={onClose}
      />
    </>
  );
};
