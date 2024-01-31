"use client";

import React, { FC, PropsWithChildren } from 'react';
import {
    GlobalStateProvider,
    ShaApplicationProvider,
    StoredFilesProvider,
} from '@shesha-io/reactjs';
import { ReadonlyURLSearchParams, usePathname, useSearchParams } from 'next/navigation';
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
                noAuth={pathname?.includes('/no-auth')}
            >
                <StoredFilesProvider baseUrl={backendUrl} ownerId={''} ownerType={''}>
                    {children}
                </StoredFilesProvider>
            </ShaApplicationProvider>
        </GlobalStateProvider>
    );
};