import { useTheme } from 'antd-style';
import { AppProgressBar } from 'next-nprogress-bar';
import React, { FC } from 'react';

export interface IProgressBarProps {

}

export const ProgressBar: FC<IProgressBarProps> = () => {
    const theme = useTheme();
    return (
        <AppProgressBar
            key={theme.colorPrimary}
            height="4px"
            color={theme.colorPrimary}
            shallowRouting
        />
    );
};