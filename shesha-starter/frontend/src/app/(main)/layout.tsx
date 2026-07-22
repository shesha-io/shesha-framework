"use client";

import { useLayoutSelection } from '@shesha-io/reactjs';
import { LAYOUT_MODE, ACTIVE_HEADER, ACTIVE_FOOTER } from '@/app-constants/layout';
import React from 'react';

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { LayoutComponent } = useLayoutSelection(LAYOUT_MODE);

    return (
        <LayoutComponent
            noPadding
            headerFormId={ACTIVE_HEADER}
            footerFormId={ACTIVE_FOOTER}
        >
            {children}
        </LayoutComponent>
    );
};