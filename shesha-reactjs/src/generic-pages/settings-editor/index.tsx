import React from 'react';
import { Page, SettingsEditor } from '@/components';
import { PageWithLayout } from '@/interfaces';

export interface ISettingsPageProps {
  id?: string;
}

export const SettingsPage: PageWithLayout<ISettingsPageProps> = () => {
  return (
    <Page
      title="Application Settings"
    >
      <SettingsEditor />
    </Page>
  );
};
