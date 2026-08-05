"use client";

import React, { FC, PropsWithChildren } from 'react';
import {
    GlobalStateProvider,
    ShaApplicationProvider,
    StoredFilesProvider,
    useNextRouter,
} from '@shesha-io/reactjs';
import { OrganisationsActionsProvider } from '@/components/dynamic-list/dynamic-actions';
import { ProgressBar } from './progressBar';

export interface IAppProviderProps {
    backendUrl: string;
    applicationKey?: string | undefined;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl, applicationKey: frontEndApp }) => {
    const nextRouter = useNextRouter();

    return (
        <GlobalStateProvider>
            <ShaApplicationProvider
                backendUrl={backendUrl}
                applicationKey={frontEndApp}
                router={nextRouter}
                noAuth={nextRouter.path?.includes('/no-auth')}
            >
                <ProgressBar />
                <OrganisationsActionsProvider>
                    <StoredFilesProvider baseUrl={backendUrl} ownerId={''} ownerType={''}>
                        {children}
                    </StoredFilesProvider>
                </OrganisationsActionsProvider>
            </ShaApplicationProvider>
        </GlobalStateProvider>
    );
};