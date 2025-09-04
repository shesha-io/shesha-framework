import React, { FC, useState } from 'react';
import { Button } from 'antd';
import { FormSettingsEditor } from '../formSettingsEditor';
import { SettingOutlined } from '@ant-design/icons';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';

export interface IFormSettingsButtonProps {
    buttonText?: string;
}

export const FormSettingsButton: FC<IFormSettingsButtonProps> = ({ buttonText }) => {
    const [settingsVisible, setSettingsVisible] = useState(false);
    const readOnly = useFormDesignerStateSelector(x => x.readOnly);

    const onSettingsClick = () => {
      setSettingsVisible(true);
    };
  
    return (
        <>
            <Button icon={<SettingOutlined />} title="Settings" size='small' onClick={onSettingsClick}/>
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