"use client";

import React, { FC, PropsWithChildren } from 'react';
import {
    GlobalStateProvider,
    ShaApplicationProvider,
    StoredFilesProvider,
} from '@/providers';
import { AppProgressBar } from 'next-nprogress-bar';
import { useTheme } from 'antd-style';
import { useNextRouter } from '@/hooks/useNextRouter';
import { EntityCrudActions } from '@/providers/dynamicActions/implementations/entityCrudActions';
import { StandardApis } from '@/providers/dynamicActions/implementations/standardApis';

export interface IAppProviderProps {
    backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
    const nextRouter = useNextRouter();

    const theme = useTheme();

    return (
        <GlobalStateProvider>
            <AppProgressBar
                height="4px"
                color={theme.colorPrimary}
                shallowRouting
            />
            <ShaApplicationProvider
                backendUrl={backendUrl}
                router={nextRouter}
                noAuth={nextRouter.path?.includes('/no-auth')}
            >
                <EntityCrudActions>
                    <StandardApis>
                        <StoredFilesProvider baseUrl={backendUrl} ownerId={''} ownerType={''}>
                            {children}
                        </StoredFilesProvider>
                    </StandardApis>
                </EntityCrudActions>
            </ShaApplicationProvider>
        </GlobalStateProvider>
    );
};