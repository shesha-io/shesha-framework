import React, { FC, useState } from 'react';
import { Button } from 'antd';
import { FormSettingsEditor } from '../formSettingsEditor';
import { SettingOutlined } from '@ant-design/icons';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface IFormSettingsButtonProps {
  buttonText?: string;
  size?: SizeType;
}

export const FormSettingsButton: FC<IFormSettingsButtonProps> = ({ buttonText, size }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const readOnly = useFormDesignerStateSelector((x) => x.readOnly);

  const onSettingsClick = () => {
    setSettingsVisible(true);
  };

  return (
        <>
            <Button icon={<SettingOutlined />} size={size} type="link" onClick={onSettingsClick} title="Form Settings">
                { buttonText !== undefined ? buttonText : "Settings" }
            </Button>
            <FormSettingsEditor
              readOnly={readOnly}
              isVisible={settingsVisible}
              close={() => {
                setSettingsVisible(false);
              }}
            />
        </>
  );
};
