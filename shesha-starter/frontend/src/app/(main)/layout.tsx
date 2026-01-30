"use client";

import { useLayoutSelection } from '@shesha-io/reactjs';
import { LAYOUT_MODE } from '@/app-constants/layout';
import React from 'react';

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { LayoutComponent } = useLayoutSelection(LAYOUT_MODE);

    return (
        <LayoutComponent noPadding>
            {children}
        </LayoutComponent>
    );
};