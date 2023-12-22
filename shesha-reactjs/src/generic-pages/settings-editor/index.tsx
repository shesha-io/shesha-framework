import React from 'react';
import { SettingsEditor } from '@/components';
import { PageWithLayout } from '@/interfaces';

export interface ISettingsPageProps {
  id?: string;
}

export const SettingsPage: PageWithLayout<ISettingsPageProps> = () => {
  return <SettingsEditor />;
};