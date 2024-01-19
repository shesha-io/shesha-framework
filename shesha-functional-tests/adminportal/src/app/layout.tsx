import React from 'react';
import { Suspense } from 'react';
import { AppProvider } from './app-provider';
import { BASE_URL } from 'src/api/utils/constants';

const BACKEND_URL = process.env.BACKEND_URL ?? BASE_URL;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Suspense>
                    <AppProvider backendUrl={BACKEND_URL}>
                        {children}
                    </AppProvider>
                </Suspense>
            </body>
        </html>
    );
};