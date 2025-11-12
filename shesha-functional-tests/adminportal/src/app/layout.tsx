import React from 'react';
import { Suspense } from 'react';
import { AppProvider } from './app-provider';
import { unstable_noStore as noStore } from 'next/cache';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { NavigationGuardProvider } from 'next-navigation-guard';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    noStore();
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:21021';

    return (
        <html lang="en">
            <body>
                <AntdRegistry>
                    <NavigationGuardProvider>
                        <Suspense fallback={null}>
                            <AppProvider backendUrl={backendUrl}>
                                {children}
                            </AppProvider>
                        </Suspense>
                    </NavigationGuardProvider>
                </AntdRegistry>
            </body>
        </html>
    );
};