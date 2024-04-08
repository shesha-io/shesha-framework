import React, { FC, PropsWithChildren, useEffect, useState } from 'react';
import { SheshaCommonContexts } from '../../dataContextManager/models';
import DataContextBinder from '@/providers/dataContextProvider/dataContextBinder';
import { ApplicationContext, IApplicationContext } from '../publicApi';
import { useApplicationContextMetadata } from '../publicApi/metadata';
import { useHttpClient } from '../publicApi/http/hooks';
import { useAuthState } from '@/providers';
import { IUserProfileInfo } from '../publicApi/currentUser/api';
import { useCacheProvider } from '@/hooks/useCache';
import { useEntityMetadataFetcher } from '@/providers/metadataDispatcher/entities/useEntityMetadataFetcher';

export interface IApplicationDataProviderProps {

}

export const ApplicationDataProvider: FC<PropsWithChildren<IApplicationDataProviderProps>> = ({ children }) => {
  const contextMetadata = useApplicationContextMetadata();
  const httpClient = useHttpClient();
  const cacheProvider = useCacheProvider();
  const metadataFetcher = useEntityMetadataFetcher();

  const [contextData] = useState<IApplicationContext>(() => new ApplicationContext(httpClient, cacheProvider, metadataFetcher));

  const { loginInfo } = useAuthState(false) ?? {};
  useEffect(() => {
    const profile: IUserProfileInfo = loginInfo
      ? {
        id: loginInfo.id?.toString(),
        userName: loginInfo.userName,
        firstName: loginInfo.firstName,
        lastName: loginInfo.lastName
      }
      : undefined;

    contextData.user.setProfileInfo(profile);
  }, [loginInfo, contextData.user]);

  return (
    <DataContextBinder
      id={SheshaCommonContexts.ApplicationContext}
      name={SheshaCommonContexts.ApplicationContext}
      description={'Application context'}
      type={'root'}

      metadata={contextMetadata}
      data={contextData}
    >
      {children}
    </DataContextBinder>
  );
};