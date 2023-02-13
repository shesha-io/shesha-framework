import React, { FC, useState } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FormSettingsEditor } from './formSettingsEditor';
//import { useFormDesigner } from '../../providers/formDesigner';

export interface IFormHeaderProps {}

export const FormDesignerHeader: FC<IFormHeaderProps> = () => {
  //const { name, module } = useFormDesigner();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const onSettingsClick = () => {
    setSettingsVisible(true);
  };

  return (
    <div className="content-heading">
      <div className="sha-designer-header">
        <div className="sha-designer-header-left">
          <h3 className="heading">
            {/* View: {module ? `${module}/` : ''}{name} */}
          </h3>
        </div>
        <div className="sha-designer-header-right">
          <Button icon={<SettingOutlined />} type="link" onClick={onSettingsClick}>
            Settings
          </Button>
          <FormSettingsEditor
            isVisible={settingsVisible}
            close={() => {
              setSettingsVisible(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FormDesignerHeader;
