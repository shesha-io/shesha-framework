"use client";

import React, { FC, PropsWithChildren } from 'react';
import {
    GlobalStateProvider,
    ShaApplicationProvider,
    StoredFilesProvider,
} from '@/providers';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MainLayout } from '@/components';
import { AppProgressBar } from 'next-nprogress-bar';
import { useTheme } from 'antd-style';
import { useNextRouter } from '@/hooks/useNextRouter';

export interface IAppProviderProps {
    backendUrl: string;
}

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
    const nextRouter = useNextRouter();

    const theme = useTheme();

    const noAuthRoutes = ['/no-auth', '/login', '/account/forgot-password', '/account/reset-password'];
    const noAuth = Boolean(noAuthRoutes.find(r => nextRouter.path?.includes(r)));

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
                noAuth={false}
            >
                <StoredFilesProvider baseUrl={backendUrl} ownerId={''} ownerType={''}>
                    <ConditionalWrap condition={!noAuth} wrap={cnt => <MainLayout noPadding>{cnt}</MainLayout>}>
                        {children}
                    </ConditionalWrap>
                </StoredFilesProvider>
            </ShaApplicationProvider>
        </GlobalStateProvider>
    );
};