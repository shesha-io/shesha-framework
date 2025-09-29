'use client';

import React, { FC, PropsWithChildren } from 'react';
import { GlobalStateProvider, ShaApplicationProvider, StoredFilesProvider } from '@/providers';
import { useNextRouter } from '@/hooks/useNextRouter';
import { EntityCrudActions } from '@/providers/dynamicActions/implementations/entityCrudActions';
import { StandardApis } from '@/providers/dynamicActions/implementations/standardApis';
import { UrlActions } from '@/providers/dynamicActions/implementations/dataSourceDynamicMenu/urlDynamicMenuItem';
import { EntityActions } from '@/providers/dynamicActions/implementations/dataSourceDynamicMenu/entityDynamicMenuItem';

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
        <EntityCrudActions>
          <UrlActions>
            <EntityActions>
              <StandardApis>
                <StoredFilesProvider baseUrl={backendUrl} ownerId="" ownerType="">
                  {children}
                </StoredFilesProvider>
              </StandardApis>
            </EntityActions>
          </UrlActions>
        </EntityCrudActions>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};
