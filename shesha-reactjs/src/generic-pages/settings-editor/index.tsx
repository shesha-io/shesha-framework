import React, { FC } from 'react';
import { SettingsEditor } from '@/components/settingsEditor';
import { Page } from '@/components/page';

export interface ISettingsPageProps {
  id?: string;
}

export const SettingsPage: FC<ISettingsPageProps> = () => {
  return (
    <Page
      title="Application Settings"
    >
      <SettingsEditor />
    </Page>
  );
};
