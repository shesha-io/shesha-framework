"use client";

import React from 'react';
import { LOGO } from 'src/app-constants/application';
import { PortalLayout } from 'src/components/index';

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PortalLayout imageProps={LOGO}>
            {children}
        </PortalLayout>
    );
};