"use client";

import React from 'react';
import { useLayoutSelection } from '@/hooks/useLayoutSelection';

export default function CommonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { LayoutComponent } = useLayoutSelection('defaultLayout');    

    return (
        <LayoutComponent noPadding>
            {children}
        </LayoutComponent>
    );
};