import React from 'react';
import { Suspense } from 'react';
import { AppProvider } from './app-provider';
import { unstable_noStore as noStore } from 'next/cache';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    noStore();
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:21021';
    const applicationKey = process.env.APPLICATION_KEY ?? undefined;

    return (
        <html lang="en">
            <body>
                <Suspense>
                    <AntdRegistry>
                        <AppProvider backendUrl={backendUrl} applicationKey={applicationKey}>
                            {children}
                        </AppProvider>
                    </AntdRegistry>
                </Suspense>
            </body>
        </html>
    );
};