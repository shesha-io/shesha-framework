"use client";

import React, { FC, PropsWithChildren } from 'react';
import {
    GlobalStateProvider,
    ShaApplicationProvider,
    StoredFilesProvider,
    useNextRouter,
} from '@shesha-io/reactjs';
import { OrganisationsActionsProvider } from '@/components/dynamic-list/dynamic-actions';
import { IHttpHeadersDictionary } from '@shesha-io/reactjs/dist/providers/sheshaApplication/contexts';

export interface IAppProviderProps {
    backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
    const nextRouter = useNextRouter();
    const buildHttpHeaders = (): IHttpHeadersDictionary => {
	const organisationId = 'Testing';
        return {
            'Organisation-Id': organisationId || ''
        };
    };
    return (
        <GlobalStateProvider>
            <ShaApplicationProvider
                backendUrl={backendUrl}
                router={nextRouter}
                noAuth={nextRouter.path?.includes('/no-auth')}
                buildHttpRequestHeaders={buildHttpHeaders}
            >
                <OrganisationsActionsProvider>
                    <StoredFilesProvider baseUrl={backendUrl} ownerId={''} ownerType={''}>
                        {children}
                    </StoredFilesProvider>
                </OrganisationsActionsProvider>
            </ShaApplicationProvider>
        </GlobalStateProvider>
    );
};