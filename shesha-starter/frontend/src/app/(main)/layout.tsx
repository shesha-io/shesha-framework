"use client";

import { MainLayout } from '@shesha-io/reactjs';
import React from 'react';

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MainLayout noPadding>
            {children}
        </MainLayout>
    );
};