import React from 'react';
import { FC } from 'react';
import { Row, Col, Typography } from 'antd';
import SettingsMenu from './settingsMenu';
import { SettingsEditorProvider } from './provider';
import SettingEditor from './settingEditor';
import SettingsEditorToolbar from './toolbar';

const { Title } = Typography;

export interface ISettingsEditorProps {

}

export const SettingsEditor: FC<ISettingsEditorProps> = () => {
  return (
    <SettingsEditorProvider>
      <div className="sha-page">
        <div className="sha-page-heading">
          <div className="sha-page-title" style={{ justifyContent: 'left' }}>
            <Title level={4} style={{ margin: 'unset' }}>
              Application Settings
            </Title>
          </div>
        </div>
        <div className="sha-page-content sha-settings-editor">
          <SettingsEditorToolbar />
          <Row>
            <Col span={8} className="sha-settings-editor-sidebar">
              <SettingsMenu />
            </Col>
            <Col span={16} className="sha-settings-editor-main">
              <SettingEditor />
            </Col>
          </Row>
        </div>
      </div>
    </SettingsEditorProvider>
  );
};

export default SettingsEditor;