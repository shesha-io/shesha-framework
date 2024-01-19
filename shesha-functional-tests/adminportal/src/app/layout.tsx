import React from 'react';
import { Suspense } from 'react';
import { AppProvider } from './app-provider';

const BASE_URL = process.env.BASE_URL ?? "http://localhost:21021";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Suspense>
                    <AppProvider backendUrl={BASE_URL}>
                        {children}
                    </AppProvider>
                </Suspense>
            </body>
        </html>
    );
};