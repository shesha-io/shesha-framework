import React, { FC } from 'react';
import { Page } from '@/components';
import { ConfigurableThemeContent } from './content';
import { useTheme } from '@/index';

export const ConfigurableThemePage: FC = () => {
  const { theme, changeTheme } = useTheme();

  return (
    <Page title="Customize theme">
      <ConfigurableThemeContent value={theme} onChange={changeTheme} />
    </Page>
  );
};
