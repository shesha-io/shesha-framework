import React from 'react';
import { Page, SettingsEditor } from '@/components';
import { PageWithLayout } from '@/interfaces';
import { PERM_PAGES_APP_SETTINGS } from '@/shesha-constants';

export interface ISettingsPageProps {
  id?: string;
}

export const SettingsPage: PageWithLayout<ISettingsPageProps> = () => {
  return (
    <Page title="Application Settings" requiredPermissions={[PERM_PAGES_APP_SETTINGS]}>
      <SettingsEditor />
    </Page>
  );
};
