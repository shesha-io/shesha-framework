import React from 'react';
import { SettingsEditor } from '../../components';
import { PageWithLayout } from '../../interfaces';

export interface ISettingsEditorPageProps {
  id?: string;
}

const SettingsEditorPage: PageWithLayout<ISettingsEditorPageProps> = () => {
  return <SettingsEditor />;
};

export default SettingsEditorPage;
