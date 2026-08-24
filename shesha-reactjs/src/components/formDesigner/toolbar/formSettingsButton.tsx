import { FC, useCallback, useState } from 'react';
import { Button } from 'antd';
import { FormSettingsEditor } from '../formSettingsEditor';
import { CheckCircleTwoTone, SettingOutlined } from '@ant-design/icons';
import { useFormDesigner, useFormDesignerReadOnly } from '@/providers/formDesigner';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { useIsDevMode } from '@/hooks/useIsDevMode';

export interface IFormSettingsButtonProps {
  buttonText?: string;
  size?: SizeType;
}

export const FormSettingsButton: FC<IFormSettingsButtonProps> = ({ buttonText, size }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const readOnly = useFormDesignerReadOnly();
  const { validateFormAsync } = useFormDesigner();
  const isDevMode = useIsDevMode();

  const onSettingsClick = (): void => {
    setSettingsVisible(true);
  };
  const onValidateClick = (): void => {
    void validateFormAsync();
  };
  const onClose = useCallback(() => {
    setSettingsVisible(false);
  }, [setSettingsVisible]);

  return (
    <>
      {isDevMode && (
        <Button icon={<CheckCircleTwoTone />} size={size} onClick={onValidateClick} title="Validate Form">
          {buttonText !== undefined ? buttonText : "Settings"}
        </Button>
      )}
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
