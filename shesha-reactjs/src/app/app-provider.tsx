'use client';

import React, { FC, PropsWithChildren } from 'react';
import { GlobalStateProvider, ShaApplicationProvider } from '@/providers';
import { useNextRouter } from '@/hooks/useNextRouter';
import { StandardApis } from '@/providers/dynamicActions/implementations/standardApis';
import { UrlActions } from '@/providers/dynamicActions/implementations/dataSourceDynamicMenu/urlDynamicMenuItem';
import { EntityActions } from '@/providers/dynamicActions/implementations/dataSourceDynamicMenu/entityDynamicMenuItem';
import '@ant-design/v5-patch-for-react-19';

export interface IAppProviderProps {
  backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
  const nextRouter = useNextRouter();

  return (
    <GlobalStateProvider>
      <ShaApplicationProvider
        backendUrl={backendUrl}
        router={nextRouter}
        noAuth={nextRouter.path?.includes('/no-auth')}
      >
        <UrlActions>
          <EntityActions>
            <StandardApis>
              {children}
            </StandardApis>
          </EntityActions>
        </UrlActions>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
