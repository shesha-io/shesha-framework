import { useTheme } from 'antd-style';
import { AppProgressProvider } from '@bprogress/next';
import React, { FC, PropsWithChildren } from 'react';

export const ProgressBar: FC<PropsWithChildren> = ({ children }) => {
    const theme = useTheme();
    return (
        <AppProgressProvider
            key={'AppProgressProvider'}
            height="4px"
            color={theme.colorPrimary}
            shallowRouting
        >
            {children}
        </AppProgressProvider>
    );
};