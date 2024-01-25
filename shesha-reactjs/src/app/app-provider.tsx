"use client";

import React, { FC, PropsWithChildren } from 'react';
import {
    GlobalStateProvider,
    ShaApplicationProvider,
    StoredFilesProvider,
} from '@/providers';
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from 'next/navigation';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MainLayout } from '@/components';
import { AppProgressBar, useRouter } from 'next-nprogress-bar';
import { useTheme } from 'antd-style';

export interface IAppProviderProps {
    backendUrl: string;
}


const convertSearchParamsToDictionary = (params: ReadonlyURLSearchParams): NodeJS.Dict<string | string[]> => {
    const entries = params.entries();
    const result: NodeJS.Dict<string | string[]> = {};
    for (const [key, value] of entries) { // each 'entry' is a [key, value] tupple
        result[key] = value;
    }
    return result;
};

export const AppProvider: FC<PropsWithChildren<IAppProviderProps>> = ({ children, backendUrl }) => {
    const router = useRouter();
    const query = useSearchParams();
    const queryParams = convertSearchParamsToDictionary(query);
    const pathname = usePathname();
    const theme = useTheme();
    
    const noAuthRoutes = ['/no-auth', '/login', '/account/forgot-password', '/account/reset-password'];
    const noAuth = Boolean(noAuthRoutes.find(r => pathname?.includes(r)));

    return (
        <GlobalStateProvider>
            <AppProgressBar
                height="4px"
                color={theme.colorPrimary}
                shallowRouting
            />
            <ShaApplicationProvider
                backendUrl={backendUrl}
                router={{
                    push: router.push,
                    back: router.back,
                    query: queryParams,
                    asPath: pathname,
                }}
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