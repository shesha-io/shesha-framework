"use client";

import React from 'react';
import { MainLayout } from '@/components';

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