import React from 'react';
import { FC } from 'react';
import { Row, Col } from 'antd';
import SettingsMenu from './settingsMenu';
import { SettingsEditorProvider } from './provider';
import SettingEditor from './settingEditor';
import SettingsEditorToolbar from './toolbar';
import { useStyles } from './styles/styles';

export interface ISettingsEditorProps {

}

export const SettingsEditor: FC<ISettingsEditorProps> = () => {
  const { styles } = useStyles();
  return (
    <SettingsEditorProvider>
      <div className={styles.shaSettingsEditor}>
        <SettingsEditorToolbar />
        <Row>
          <Col span={8}>
            <SettingsMenu />
          </Col>
          <Col span={16} className={styles.shaSettingsEditorMain}>
            <SettingEditor />
          </Col>
        </Row>
      </div>
    </SettingsEditorProvider>
  );
};

export default SettingsEditor;